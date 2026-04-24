// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {SharedWallet} from "../src/SharedWallet.sol";

contract DeploySharedWallet is Script {
    SharedWallet public sharedWallet;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        sharedWallet = new SharedWallet();

        vm.stopBroadcast();
    }
}
