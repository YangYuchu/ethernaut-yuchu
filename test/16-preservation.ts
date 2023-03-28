import { AttackInterface } from './../typechain-types/Attack/ForceAttack.sol/Attack';
import { FakeTimeZoneLibrary } from './../typechain-types/contracts/Attack/PreservationAttack.sol/FakeTimeZoneLibrary';
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

describe("Preservation", function () {

    async function deployTokenFixture(): Promise<any> {
        accounts = await ethers.getSigners();
        const [eoa] = accounts;
        console.log("eoa: " + await eoa.getAddress())
        const challengeFactory = await ethers.getContractFactory(`Preservation`);
        const challengeAddress = await createChallenge(
            `0x2754fA769d47ACdF1f6cDAa4B0A8Ca4eEba651eC`, ethers.utils.parseEther("1.0")
        );
        challenge = await challengeFactory.attach(challengeAddress);

        const attackerFactory = await ethers.getContractFactory(`PreservationAttack`);
        const FakeTimeZoneLibrary = await ethers.getContractFactory(`FakeTimeZoneLibrary`);
        const fakeTimeZoneLibrary = await FakeTimeZoneLibrary.deploy();
        await fakeTimeZoneLibrary.deployed();

        attacker = await attackerFactory.deploy(challenge.address, fakeTimeZoneLibrary.address);
        console.log("contract nonce: ", await eoa.provider.getTransactionCount(attacker.address));
        let addr = await ethers.utils.getContractAddress({
            from: attacker.address,
            nonce: BigNumber.from(`0`),
        });
        console.log("address at noune 0: ", addr);

        return { eoa, challenge, attacker };
    }

    it("solves the challenge", async function () {
        const { eoa, challenge, attacker } = await loadFixture(deployTokenFixture);

        try {
           console.log("address: ", await eoa.provider.getStorageAt(challenge.address, 2));
            tx = await attacker.attack();
            await tx.wait()
            console.log(await challenge.owner());
            console.log(await challenge.timeZone1Library());

        } catch (err) {
            console.log("error: " + err);
        }


    });

    after(async () => {
        expect(await submitLevel(challenge.address), "level not solved").to.be.true;
    });
});
