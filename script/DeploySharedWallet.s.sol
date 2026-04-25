// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {SharedWallet} from "../src/SharedWallet.sol";

contract DeploySharedWallet is Script {
    function run() external returns (SharedWallet) {
        vm.startBroadcast();

        SharedWallet wallet = new SharedWallet();
        vm.stopBroadcast();
        return wallet;
    }
}
