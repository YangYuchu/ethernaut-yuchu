import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { createChallenge, submitLevel } from "./utils";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";


let accounts: Signer[];
let eoa: Signer;
let attacker: Contract;
let challenge: Contract; // challenge contract
let tx: any;

describe("CoinFlip", function () {

    async function deployTokenFixture(): Promise<any> {
        accounts = await ethers.getSigners();
        [eoa] = accounts;
        const challengeFactory = await ethers.getContractFactory(`CoinFlip`);
        const challengeAddress = await createChallenge(
            `0x9240670dbd6476e6a32055E52A0b0756abd26fd2`, ethers.utils.parseEther("10.0")
        );
        challenge = await challengeFactory.attach(challengeAddress);

        const attackerFactory = await ethers.getContractFactory(`CoinFlipAttack`);
        attacker = await attackerFactory.deploy(challenge.address);

        return { eoa, challenge, attacker };
    }
    it("solves the challenge", async function () {
        const { eoa, challenge, attacker } = await loadFixture(deployTokenFixture);
        for (let i = 0; i < 10; i++) {
            tx = await attacker.attack();
            await tx.wait();

            // simulate waiting 1 block
            await ethers.provider.send("evm_increaseTime", [1]); // add 1 second

            // console.log(await ethers.provider.getBlockNumber());
        }

    });

    after(async () => {
        expect(await submitLevel(challenge.address), "level not solved").to.be.true;
    });
});
