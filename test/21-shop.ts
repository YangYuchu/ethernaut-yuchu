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

describe("Shop", function () {

    async function deployTokenFixture(): Promise<any> {
        accounts = await ethers.getSigners();
        [eoa] = accounts;
        const challengeFactory = await ethers.getContractFactory(`Denial`);
        const challengeAddress = await createChallenge(
            `0xCb1c7A4Dee224bac0B47d0bE7bb334bac235F842`, ethers.utils.parseEther("10.0")
        );
        challenge = await challengeFactory.attach(challengeAddress);

        const attackerFactory = await ethers.getContractFactory(`ShopAttack`);
        attacker = await attackerFactory.deploy(challenge.address);

        return { eoa, challenge, attacker };
    }

    it("solves the challenge", async function () {
        const { eoa, challenge, attacker } = await loadFixture(deployTokenFixture);

        try {
            tx = await attacker.attack();
            await tx.wait();
        } catch (err) {
            console.log("error: " + err);
        }


    });

    after(async () => {
        expect(await submitLevel(challenge.address), "level not solved").to.be.true;
    });
});
