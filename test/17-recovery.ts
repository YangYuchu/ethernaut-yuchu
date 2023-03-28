
import { expect } from "chai";
import { utils, BigNumber, Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { createChallenge, submitLevel } from "./utils";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

let accounts: Signer[];
let eoa: Signer;
let attacker: Contract;
let challenge: Contract; // challenge contract
let tx: any;

describe("Recovery", function () {

    async function deployTokenFixture(): Promise<any> {
        accounts = await ethers.getSigners();
        [eoa] = accounts;
        const challengeFactory = await ethers.getContractFactory(`Recovery`);
        const challengeAddress = await createChallenge(
            `0xb4B157C7c4b0921065Dded675dFe10759EecaA6D`, ethers.utils.parseEther("1.0")
        );
        challenge = await challengeFactory.attach(challengeAddress);

        return { eoa, challenge };
    }

    it("solves the challenge", async function () {
        const { eoa, challenge } = await loadFixture(deployTokenFixture);
        try {
            console.log(`challenge.address`, challenge.address)

            console.log(await eoa.provider.getTransactionCount(challenge.address));


            const recomputedContractAddress0 = ethers.utils.getContractAddress({
                from: challenge.address,
                nonce: BigNumber.from(`0`),
            });

            const recomputedContractAddress = ethers.utils.getContractAddress({
                from: challenge.address,
                nonce: BigNumber.from(`1`),
            });

            console.log(`recomputedContractAddress0`, recomputedContractAddress0)

            console.log(`recomputedContractAddress`, recomputedContractAddress)

            const attackerFactory = await ethers.getContractFactory(`SimpleToken`);
            attacker = await attackerFactory.attach(recomputedContractAddress);
            tx = await attacker.destroy(await eoa.getAddress());
            await tx.wait();

        } catch (err) {
            console.log("error: " + err);
        }


    });

    after(async () => {
        expect(await submitLevel(challenge.address), "level not solved").to.be.true;
    });
});
