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

describe("NaughtCoin", function () {

    async function deployTokenFixture(): Promise<any> {
        accounts = await ethers.getSigners();
        const [eoa, addr1] = accounts;
        console.log("eoa: " + await eoa.getAddress())
        console.log("addr1: " + await addr1.getAddress())
        const challengeFactory = await ethers.getContractFactory(`NaughtCoin`);
        const challengeAddress = await createChallenge(
            `0x36E92B2751F260D6a4749d7CA58247E7f8198284`, ethers.utils.parseEther("1.0")
        );
        challenge = await challengeFactory.attach(challengeAddress);

        return { eoa, challenge, addr1 };
    }

    it("solves the challenge", async function () {
        const { eoa, challenge, addr1 } = await loadFixture(deployTokenFixture);

        try {
            const balance = await challenge.balanceOf(await eoa.getAddress());
            tx = await challenge.approve(await eoa.getAddress(), balance);
            await tx.wait()

            console.log(await challenge.balanceOf(await eoa.getAddress()))
            console.log(await challenge.allowance(await eoa.getAddress(), await addr1.getAddress()))

            tx = await challenge.transferFrom(await eoa.getAddress(), await addr1.getAddress(), balance);
            await tx.wait()

        } catch (err) {
            console.log("error: " + err);
        }


    });

    after(async () => {
        expect(await submitLevel(challenge.address), "level not solved").to.be.true;
    });
});
