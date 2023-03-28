// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IVault {
  function unlock(bytes32 _password) external;
}

contract VaultAttack {
    IVault public vault;
  constructor(address challenge) {
    vault = IVault(challenge);
  }

  function attack(bytes32 _password) public {
    vault.unlock(_password);
  }
}
