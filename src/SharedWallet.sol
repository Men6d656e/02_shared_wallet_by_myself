// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

event Deposit(address indexed from, uint256 amount);
event AllowanceSet(address indexed user, uint256 amount);
event Withdrawal(address indexed user, uint256 amount);

error OnlyOwner();
error InvalidAmount();
error InsufficientAllowance(uint256 requested, uint256 available);
error WithdrawalFailed();

contract SharedWallet {
    address public immutable owner;

    mapping(address => uint256) public allowances;

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert OnlyOwner();
        }
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {
        if (msg.sender != owner) {
            revert OnlyOwner();
        }
        emit Deposit(msg.sender, msg.value);
    }

    function deposit() external payable onlyOwner {
        if (msg.value == 0) revert InvalidAmount();
        emit Deposit(msg.sender, msg.value);
    }

    function setAllowance(address _user, uint256 _amount) external onlyOwner {
        allowances[_user] = _amount;
        emit AllowanceSet(_user, _amount);
    }

    function withdraw(uint256 _amount) external {
        if (_amount == 0) revert InvalidAmount();
        if (msg.sender != owner) {
            uint256 allowed = allowances[msg.sender];
            if (_amount > allowed) {
                revert InsufficientAllowance(_amount, allowed);
            }
            allowances[msg.sender] -= _amount;
        }

        (bool success,) = msg.sender.call{value: _amount}("");

        if (!success) {
            revert WithdrawalFailed();
        }

        emit Withdrawal(msg.sender, _amount);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
