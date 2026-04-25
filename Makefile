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
deploy-anvil:
	forge script script/DeploySharedWallet.s.sol:DeploySharedWallet --rpc-url http://127.0.0.1:8545 --interactives 1 --broadcast --force

# Security check with Slither (if installed)
slither:
	slither .
