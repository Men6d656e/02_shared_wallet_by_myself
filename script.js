// --- Configuration ---
// IMPORTANT: Update this address with your deployed contract address from `make deploy-anvil`
const CONTRACT_ADDRESS = "0x73087A737816ae623E2C9fb7175e1AcC1Dca99B1";

const ABI = [
  "function OWNER() view returns (address)",
  "function allowances(address) view returns (uint256)",
  "function deposit() payable",
  "function setAllowance(address _user, uint256 _amount)",
  "function withdraw(uint256 _amount)",
  "function getBalance() view returns (uint256)",
];

// --- State ---
let provider;
let signer;
let contract;
let currentAccount = null;
let ownerAddress = null;

// --- DOM Elements ---
const connectBtn = document.getElementById("connect-btn");
const networkBadge = document.getElementById("network-badge");
const contractBalanceEl = document.getElementById("contract-balance");
const walletBalanceEl = document.getElementById("wallet-balance");
const userRoleEl = document.getElementById("user-role");
const userAllowanceEl = document.getElementById("user-allowance");

const ownerPanel = document.getElementById("owner-panel");
const userPanel = document.getElementById("user-panel");

const depositAmountInput = document.getElementById("deposit-amount");
const depositBtn = document.getElementById("deposit-btn");

const allowanceAddressInput = document.getElementById("allowance-address");
const allowanceAmountInput = document.getElementById("allowance-amount");
const setAllowanceBtn = document.getElementById("set-allowance-btn");

const withdrawAmountInput = document.getElementById("withdraw-amount");
const withdrawBtn = document.getElementById("withdraw-btn");

// --- Initialization ---
async function init() {
  if (typeof window.ethereum !== "undefined") {
    provider = new ethers.BrowserProvider(window.ethereum);

    // Listen for account changes
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", () => window.location.reload());

    // Check if already connected
    const accounts = await provider.listAccounts();
    if (accounts.length > 0) {
      handleAccountsChanged(accounts);
    }
  } else {
    showToast("Please install MetaMask to use this dApp.", "error");
    connectBtn.innerText = "Install Wallet";
  }

  connectBtn.addEventListener("click", connectWallet);
  depositBtn.addEventListener("click", handleDeposit);
  setAllowanceBtn.addEventListener("click", handleSetAllowance);
  withdrawBtn.addEventListener("click", handleWithdraw);
}

// --- Wallet Connection ---
async function connectWallet() {
  if (!provider) {
    showToast("No Web3 wallet detected.", "error");
    return;
  }

  try {
    connectBtn.innerText = "Connecting...";
    connectBtn.disabled = true;
    const accounts = await provider.send("eth_requestAccounts", []);
    handleAccountsChanged(accounts);
  } catch (err) {
    console.error(err);
    showToast("Failed to connect wallet.", "error");
    connectBtn.innerText = "Connect Wallet";
    connectBtn.disabled = false;
  }
}

async function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    currentAccount = null;
    networkBadge.innerText = "Not Connected";
    networkBadge.className = "badge";
    connectBtn.innerText = "Connect Wallet";
    connectBtn.disabled = false;
    resetUI();
  } else {
    currentAccount =
      typeof accounts[0] === "string" ? accounts[0] : accounts[0].address;

    // Format address for display
    const shortAddr = `${currentAccount.substring(0, 6)}...${currentAccount.substring(38)}`;
    networkBadge.innerText = shortAddr;
    networkBadge.className = "badge connected";
    connectBtn.innerText = "Connected";
    connectBtn.disabled = true;

    signer = await provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    await updateData();
  }
}

// --- Data Fetching ---
async function updateData() {
  if (!contract || !currentAccount) return;

  try {
    // Fetch contract balance
    const contractBalance = await contract.getBalance();
    contractBalanceEl.innerText = `${parseFloat(ethers.formatEther(contractBalance)).toFixed(4)} ETH`;

    // Fetch wallet balance
    const walletBalance = await provider.getBalance(currentAccount);
    walletBalanceEl.innerText = `${parseFloat(ethers.formatEther(walletBalance)).toFixed(4)} ETH`;

    // Determine Role
    if (!ownerAddress) {
      ownerAddress = await contract.OWNER();
    }

    const isOwner = currentAccount.toLowerCase() === ownerAddress.toLowerCase();

    if (isOwner) {
      userRoleEl.innerText = "Owner";
      userRoleEl.className = "role-badge owner";
      ownerPanel.style.opacity = "1";
      ownerPanel.style.pointerEvents = "auto";
      userAllowanceEl.innerText = "Unlimited (Owner)";
    } else {
      userRoleEl.innerText = "User";
      userRoleEl.className = "role-badge user";
      ownerPanel.style.opacity = "0.5";
      ownerPanel.style.pointerEvents = "none";

      // Fetch Allowance for User
      const allowance = await contract.allowances(currentAccount);
      userAllowanceEl.innerText = `${parseFloat(ethers.formatEther(allowance)).toFixed(4)} ETH`;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    showToast(
      "Error reading from contract. Is your network set to local Anvil?",
      "error",
    );
  }
}

function resetUI() {
  contractBalanceEl.innerText = "0.00 ETH";
  walletBalanceEl.innerText = "0.00 ETH";
  userRoleEl.innerText = "Unknown";
  userRoleEl.className = "role-badge";
  userAllowanceEl.innerText = "0.00 ETH";
  ownerPanel.style.opacity = "1";
  ownerPanel.style.pointerEvents = "auto";
}

// --- Contract Interactions ---
async function handleDeposit() {
  const val = depositAmountInput.value;
  if (!val || val <= 0) return showToast("Enter a valid amount.", "warning");

  try {
    depositBtn.disabled = true;
    depositBtn.innerText = "Depositing...";

    const tx = await contract.deposit({ value: ethers.parseEther(val) });
    showToast("Transaction submitted. Waiting for confirmation...", "info");

    await tx.wait();
    showToast("Deposit successful!", "success");
    depositAmountInput.value = "";
    await updateData();
  } catch (err) {
    console.error(err);
    showToast(err.reason || "Deposit failed. Are you the owner?", "error");
  } finally {
    depositBtn.disabled = false;
    depositBtn.innerText = "Deposit";
  }
}

async function handleSetAllowance() {
  const addr = allowanceAddressInput.value;
  const val = allowanceAmountInput.value;

  if (!ethers.isAddress(addr)) return showToast("Invalid address.", "warning");
  if (!val || val < 0) return showToast("Enter a valid amount.", "warning");

  try {
    setAllowanceBtn.disabled = true;
    setAllowanceBtn.innerText = "Setting...";

    const tx = await contract.setAllowance(addr, ethers.parseEther(val));
    showToast("Transaction submitted. Waiting for confirmation...", "info");

    await tx.wait();
    showToast("Allowance set successfully!", "success");
    allowanceAddressInput.value = "";
    allowanceAmountInput.value = "";
    await updateData();
  } catch (err) {
    console.error(err);
    showToast(err.reason || "Failed to set allowance.", "error");
  } finally {
    setAllowanceBtn.disabled = false;
    setAllowanceBtn.innerText = "Set Allowance";
  }
}

async function handleWithdraw() {
  const val = withdrawAmountInput.value;
  if (!val || val <= 0) return showToast("Enter a valid amount.", "warning");

  try {
    withdrawBtn.disabled = true;
    withdrawBtn.innerText = "Withdrawing...";

    const tx = await contract.withdraw(ethers.parseEther(val));
    showToast("Transaction submitted. Waiting for confirmation...", "info");

    await tx.wait();
    showToast("Withdrawal successful!", "success");
    withdrawAmountInput.value = "";
    await updateData();
  } catch (err) {
    console.error(err);
    // Ethers error parsing for custom errors
    if (err.message.includes("InsufficientAllowance")) {
      showToast("Withdrawal failed: Insufficient allowance.", "error");
    } else {
      showToast("Withdrawal failed.", "error");
    }
  } finally {
    withdrawBtn.disabled = false;
    withdrawBtn.innerText = "Withdraw";
  }
}

// --- Utils ---
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  let icon = "ℹ️";
  if (type === "success") icon = "✅";
  if (type === "error") icon = "❌";
  if (type === "warning") icon = "⚠️";

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "fadeOut 0.3s forwards";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Initialize on load
window.addEventListener("DOMContentLoaded", init);
