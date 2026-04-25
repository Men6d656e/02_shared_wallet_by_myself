# 🏦 Shared Wallet DApp

A decentralized fund management application built with **Foundry** and vanilla **HTML/CSS/JS**. This dApp allows a contract owner to securely deposit funds and allocate specific withdrawal allowances to multiple users, ensuring transparent and controlled fund management.

---

## 📑 Table of Contents

1. [Live Deployments & Links](#live-deployments--links)
2. [Architecture & Component Layout](#architecture--component-layout)
   - [Smart Contract](#smart-contract)
   - [Component Architecture (Frontend)](#component-architecture-frontend)
   - [File Layout](#file-layout)
3. [Setup & Installation](#setup--installation)
   - [Prerequisites](#prerequisites)
   - [Environment Setup](#environment-setup)
4. [Complete Testing Flow (Local Anvil)](#complete-testing-flow-local-anvil)
   - [Step 1: Start Local Node & Deploy](#step-1-start-local-node--deploy)
   - [Step 2: Configure Wallets & Network](#step-2-configure-wallets--network)
   - [Step 3: Serve the Frontend](#step-3-serve-the-frontend)
   - [Step 4: Test the Shared Wallet Flow](#step-4-test-the-shared-wallet-flow)
5. [Testnet Deployment & Flow (Sepolia)](#testnet-deployment--flow-sepolia)
6. [Makefile Automation](#makefile-automation)
7. [License](#license)
8. [LinkedIn Post](#linkedin-post)

---

## Live Deployments & Links

- **Smart Contract (Sepolia):** `0xd17F0535931b108c6a51bc4D76b744398c9e6110`
- **Frontend App:** Served via **GitHub Pages**. *(Check the GitHub repository's "Deployments" section for the live link).*

---

## Architecture & Component Layout

### Smart Contract

The logical flow of the smart contract (`SharedWallet.sol`) revolves around an **Owner** and designated **Users**:
- 👑 **Owner**: The deployer of the contract. The owner can deposit Ether and set withdrawal `allowances` for specific wallet addresses.
- 👤 **Users**: Wallet addresses granted an allowance by the owner. Users can withdraw funds up to their designated limit.

### Component Architecture (Frontend)

The frontend is built using a lightweight, static architecture (Vanilla JS + HTML + CSS) integrated with **Ethers.js v6**.
- **`index.html`**: The main UI structure, divided into two core dashboards:
  - 🛠️ **Owner Panel**: Only active for the contract owner. Contains controls for depositing funds and setting allowances for users.
  - 💸 **User Panel**: The interface for users to check their balances, view their allowance limit, and withdraw funds.
- **`script.js`**: Handles MetaMask connections, fetches live blockchain data (balances, roles, allowances), and manages contract interactions.
- **`style.css`**: Provides a clean, modern aesthetic with a "Terminal Elegance" theme.

### File Layout

- 📁 `src/SharedWallet.sol` — The core Solidity smart contract.
- 📁 `script/DeploySharedWallet.s.sol` — Foundry deployment scripts.
- 📁 `test/` — Smart contract tests for logical verification.
- 📄 `Makefile` — Automation script for testing, building, and deployment.
- 📄 `index.html` / `how-it-works.html` / `style.css` / `script.js` — The static frontend.

---

## Setup & Installation

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) installed.
- [Node.js](https://nodejs.org/) installed (for running the local server via `npx`).
- A Web3 Wallet (e.g., MetaMask).
- An Alchemy/Infura RPC URL for Sepolia.

### Environment Setup

1. Clone the repository.
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` with your own details:
   ```env
   SEPOLIA_RPC_URL=<your_sepolia_rpc_url>
   EATHER_SCAN_API_KEY=<your_etherscan_api_key>
   ANVIL_RPC_URL=http://127.0.0.1:8545
   ANVIL_PRIVATE_KEY=<your_local_anvil_private_key>
   ```

---

## Complete Testing Flow (Local Anvil)

To truly understand how the Owner and User roles interact, follow this complete local testing flow.

### Step 1: Start Local Node & Deploy

1. Open a terminal and start the Anvil node:
   ```bash
   make anvil
   ```
2. Open a **second terminal** and deploy the contract:
   ```bash
   make deploy-anvil
   ```
3. 📝 **Note:** After deployment, copy the deployed contract address from the terminal output and update the `CONTRACT_ADDRESS` variable at the top of your `script.js` file.

### Step 2: Configure Wallets & Network

1. Open your Web3 Wallet (e.g., MetaMask).
2. Add the **Localhost 8545** network manually:
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency: `ETH`
3. 🦊 **Import Owner Account:** Copy Account #0's private key from the Anvil terminal output and import it into MetaMask. This account is the **Owner**.
4. 🦊 **Import User Account:** Copy Account #1's private key from the Anvil terminal and import it as a second account in MetaMask. This account will act as the **User**.

### Step 3: Serve the Frontend

1. Serve the UI locally using `npx`:
   ```bash
   npx serve .
   ```
2. Open the provided `http://localhost:3000` link in your browser.

### Step 4: Test the Shared Wallet Flow

1. **As the Owner:** Connect your wallet using Account #0. You will see the **Owner Panel**. 
   - Deposit 10 ETH into the contract. 
   - Copy Account #1's public address from MetaMask and set an allowance of 2 ETH for them.
2. **As the User:** Open a **different browser** (or an Incognito window), serve the site again, and connect with Account #1. 
   - You will see the **User Panel**. 
   - Your allowance will display as 2 ETH. 
   - Withdraw 1 ETH.
3. 🎉 **Result:** The contract balance decreases, the user's allowance decreases, and the user's personal wallet balance increases. This perfectly demonstrates the shared wallet concept!

---

## Testnet Deployment & Flow (Sepolia)

When you are ready to test publicly, use the Sepolia testnet.

1. **Deploy:** Ensure your `.env` is configured with your Sepolia RPC and API keys, then run:
   ```bash
   make deploy-sepolia
   ```
   *(Note: This uses `--interactives 1` to securely prompt for your private key in the terminal).*
2. **Update Address:** Update the `CONTRACT_ADDRESS` in `script.js` with your new Sepolia contract address.
3. **Network Switch:** In MetaMask, switch to the **Sepolia network** for both your Owner and User test accounts.
4. **Interact:** Serve the frontend via `npx serve .` or use GitHub Pages. Follow the exact same flow as the local testing (Deposit → Set Allowance → Withdraw) but using Sepolia test ETH.

---

## Makefile Automation

This project leverages a `Makefile` to automate standard developer workflows.

- 🧹 `make clean`: Removes the build artifacts.
- 📦 `make install`: Installs Foundry dependencies.
- 🏗️ `make build`: Compiles the smart contracts.
- 🧪 `make test`: Runs the test suite with verbose output.
- 📊 `make coverage`: Generates a test coverage report.
- 🖌️ `make fmt`: Formats the Solidity codebase.
- ⛓️ `make anvil`: Starts a local Anvil blockchain node.
- 🚀 `make deploy-anvil`: Cleans, builds, tests, and deploys the contract to a local Anvil instance.
- 🌍 `make deploy-sepolia`: Deploys the contract to Sepolia and verifies it on Etherscan.
- 🛡️ `make slither`: Runs a security check using Slither.

---

## License

This project is fully open-source and is licensed under the **MIT License**. Feel free to explore the code, modify it, and deploy it using your own resources. See the `LICENSE` file for full details.

---

## LinkedIn Post

I have explained the complete architecture and logical flow of this project in a detailed LinkedIn post. You can find the breakdown and my insights here:

**[🔗 Add your LinkedIn Post Link Here]**
