-include .env

.PHONY: all test clean deploy-anvil

all: clean install build

# Clean the repo
clean:
	forge clean

# Install dependencies
install:
	forge install

# Build the project
build:
	forge build

# Run tests
test:
	forge test -vvv

# Run coverage
coverage:
	forge coverage

# Format code
fmt:
	forge fmt

# Run Anvil in background (you might want to run this in a separate terminal)
anvil:
	anvil

# Deploy to Anvil (using default Anvil 0th private key)
deploy-anvil: clean build test
	forge script script/DeploySharedWallet.s.sol --rpc-url $(ANVIL_RPC_URL) --private-key $(ANVIL_PRIVATE_KEY) --broadcast --force


# Uses variables from .env and asks for private key interactively
deploy-sepolia: clean build test
	forge script script/DeploySharedWallet.s.sol \
	--rpc-url $(SEPOLIA_RPC_URL) \
	--broadcast \
	--interactives 1 \
	--verify \
	--etherscan-api-key $(EATHER_SCAN_API_KEY)

# Security check with Slither (if installed)
slither:
	slither .
