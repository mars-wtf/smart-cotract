import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";

require("dotenv").config();

const PRIVATE_KEY: any = process.env.PRIVATE_KEY;
const SEPOLIA_URL: any = process.env.SEPOLIA_URL;

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  // defaultNetwork: "sepolia",
  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY],
    },
    base: {
      url: "https://base-mainnet.g.alchemy.com/v2/Irv4oep_ylEQ2aq-K9GLbWpXDmhydctp",
      accounts: [PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_KEY!,
      base: "3QBCHR62MJE2Q6T5HMXXBJEM3Q9JVDCSZ3" //your base scan API key.
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
         apiURL: "https://api.basescan.org/api",
         browserURL: "https://basescan.org"
        }
      }
    ]
  },
  sourcify: {
    enabled: true,
  },
};

export default config;

