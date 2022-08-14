import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const {
  PRIVATE_KEY,
  POLYGONSCAN_API_KEY,
} = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    mumbai: {
      url: 'https://rpc.ankr.com/polygon_mumbai',
      accounts: [`0x${PRIVATE_KEY}`],
    },
    polygon: {
      url: 'https://rpc.ankr.com/polygon',
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: POLYGONSCAN_API_KEY
  },
};

export default config;
