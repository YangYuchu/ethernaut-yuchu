// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MagicNumAttackFactory {
  event Log(address addr);

  function deploy() external returns (address) {
    bytes memory code = hex"69602a60005260206000f3600052600a6016f3";
    address addr;
    assembly {
      addr := create(0, add(code, 0x20), mload(code))
      if iszero(extcodesize(addr)) {
        revert(0, 0)
      }
    }
    emit Log(addr);
  }
}
