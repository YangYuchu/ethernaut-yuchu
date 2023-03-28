// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IForta {
    function setDetectionBot(address detectionBotAddress) external;

    function notify(address user, bytes calldata msgData) external;

    function raiseAlert(address user) external;
}

contract DetectionBot {
    address public vault;
    address public user;

    constructor(address _vault) {
        vault = _vault;
        user = msg.sender;
    }

    function handleTransaction(address user, bytes calldata msgData) external {
        if (msgData.length == 0) {
            return;
        }

        (address to, uint256 value, address origSender) = abi.decode(msgData, (address, uint256, address));
        bytes4 selector = bytes4(msgData[0:4]);

        if (selector == bytes4(keccak256(bytes("delegateTransfer(address,uint256,address)"))) && origSender == vault) {
            IForta(msg.sender).raiseAlert(user);
        }
    }
}
