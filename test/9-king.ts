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

describe("King", function () {

    async function deployTokenFixture(): Promise<any> {
        accounts = await ethers.getSigners();
        [eoa] = accounts;
        const challengeFactory = await ethers.getContractFactory(`King`);
        const challengeAddress = await createChallenge(
            `0x725595BA16E76ED1F6cC1e1b65A88365cC494824`, ethers.utils.parseEther("1.0")
        );
        challenge = await challengeFactory.attach(challengeAddress);

        const attackerFactory = await ethers.getContractFactory(`KingAttack`);
        attacker = await attackerFactory.deploy(challenge.address, { value: ethers.utils.parseEther("10.0") });

        return { eoa, challenge, attacker };
    }

    it("solves the challenge", async function () {
        const { eoa, challenge, attacker } = await loadFixture(deployTokenFixture);

        try {
            const prize = await challenge.prize();
            const tx = await attacker.attack({ value: prize + 1 });
            const receipt = await tx.wait();
            // console.log({receipt});
        } catch (err) {
            console.log("error: " + err);
        }


    });

    after(async () => {
        expect(await submitLevel(challenge.address), "level not solved").to.be.true;
    });
});
