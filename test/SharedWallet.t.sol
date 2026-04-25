// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {SharedWallet} from "../src/SharedWallet.sol";

contract SharedWalletTest is Test {
    SharedWallet wallet;
    address owner = address(1);
    address user1 = address(2);
    address user2 = address(3);

    function setUp() public {
        vm.prank(owner);
        wallet = new SharedWallet();
        vm.deal(owner, 100 ether);
        vm.deal(user1, 10 ether);
    }

    function test_OwnerCanDeposit() public {
        vm.prank(owner);
        wallet.deposit{value: 10 ether}();
        assertEq(wallet.getBalance(), 10 ether);
    }

    function test_OwnerCanDepositViaReceive() public {
        vm.prank(owner);
        (bool success, ) = address(wallet).call{value: 10 ether}("");
        assertTrue(success);
        assertEq(wallet.getBalance(), 10 ether);
    }

    function test_NotOwnerCannotDeposit() public {
        vm.prank(user1);
        vm.expectRevert(SharedWallet.OnlyOwner.selector);
        wallet.deposit{value: 10 ether}();
    }

    function test_NotOwnerCannotDepositViaRecieve() public {
        vm.prank(user1);
        vm.expectRevert(SharedWallet.OnlyOwner.selector);
        (bool success, ) = address(wallet).call{value: 1 ether}("");
        assertTrue(success);
    }

    function test_OwnerCanSetAllowance() public {
        vm.prank(owner);
        wallet.setAllowance(user1, 5 ether);
        assertEq(wallet.allowances(user1), 5 ether);
    }

    function test_NonOwnerCannotSetAllowance() public {
        vm.prank(user1);
        vm.expectRevert(SharedWallet.OnlyOwner.selector);
        wallet.setAllowance(user2, 5 ether);
    }

    function test_UserCanWithdrawWithinAllowance() public {
        // SetUp
        vm.startPrank(owner);
        wallet.deposit{value: 10 ether}();
        wallet.setAllowance(user1, 5 ether);
        vm.stopPrank();

        uint256 initialBalance = user1.balance;
        vm.prank(user1);
        wallet.withdraw(3 ether);

        assertEq(wallet.allowances(user1), 2 ether);
        assertEq(user1.balance, initialBalance + 3 ether);
        assertEq(wallet.getBalance(), 7 ether);
    }

    function test_UserCannotWithdrawAboveAllowance() public {
        vm.startPrank(owner);
        wallet.deposit{value: 10 ether}();
        wallet.setAllowance(user1, 2 ether);
        vm.stopPrank();

        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                SharedWallet.InsufficientAllowance.selector,
                3 ether,
                2 ether
            )
        );
        wallet.withdraw(3 ether);
    }

    function test_OwnerCanWithDrawWithoutAllowance() public {
        vm.startPrank(owner);
        wallet.deposit{value: 10 ether}();
        uint256 initialBalance = owner.balance;

        wallet.withdraw(4 ether);
        vm.stopPrank();

        assertEq(owner.balance, initialBalance + 4 ether);
        assertEq(wallet.getBalance(), 6 ether);
    }

    function test_RevertIfWithdrawAmountIsZero() public {
        vm.prank(owner);
        vm.expectRevert(SharedWallet.InvalidAmount.selector);
        wallet.withdraw(0);
    }

    function test_RevertIfDepositAmountIsZero() public {
        vm.prank(owner);
        vm.expectRevert(SharedWallet.InvalidAmount.selector);
        wallet.deposit{value: 0}();
    }
}
