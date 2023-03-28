import dotenv from "dotenv";
dotenv.config(); // load env vars from .env

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "./tasks/create-key";

const { ARCHIVE_URL, MNEMONIC } = process.env;

if (!ARCHIVE_URL)
  throw new Error(
    `ARCHIVE_URL env var not set. Copy .env.template to .env and set the env var`
  );
if (!MNEMONIC)
  throw new Error(
    `MNEMONIC env var not set. Copy .env.template to .env and set the env var`
  );

const accounts = {
  // derive accounts from mnemonic, see tasks/create-key
  mnemonic: MNEMONIC,
};


const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      // old ethernaut compilers
      { version: "0.5.0" },
      { version: "0.6.0" },
      { version: "0.6.12" },
      { version: "0.7.3" },
      { version: "0.8.0" },
      { version: "0.8.18" }
    ],
  },
  networks: {
    rinkeby: {
      url: ARCHIVE_URL,
      accounts,
    },
    hardhat: {
      accounts,
      forking: {
        url: ARCHIVE_URL,
        blockNumber: 8631488
      },
    },
  }
};

export default config;
