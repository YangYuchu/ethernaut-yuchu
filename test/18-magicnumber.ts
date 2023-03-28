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

describe("MagicNumber", function () {

    async function deployTokenFixture(): Promise<any> {
        accounts = await ethers.getSigners();
        [eoa] = accounts;
        const challengeFactory = await ethers.getContractFactory(`MagicNum`);
        const challengeAddress = await createChallenge(
            `0xFe18db6501719Ab506683656AAf2F80243F8D0c0`, ethers.utils.parseEther("1.0")
        );
        challenge = await challengeFactory.attach(challengeAddress);

        const attackerFactory = await ethers.getContractFactory(`MagicNumAttackFactory`);
        attacker = await attackerFactory.deploy();

        return { eoa, challenge, attacker };
    }

    it("solves the challenge", async function () {
        const { eoa, challenge, attacker } = await loadFixture(deployTokenFixture);

        try {
            tx = await attacker.deploy();
            const txReceipt = await tx.wait();
            const [event] = txReceipt.events;
            const [addr] = event.args;
            console.log(addr);

            tx = await challenge.setSolver(addr);
            await tx.wait();


        } catch (err) {
            console.log("error: " + err);
        }


    });

    after(async () => {
        expect(await submitLevel(challenge.address), "level not solved").to.be.true;
    });
});
