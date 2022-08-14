import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { task } from "hardhat/config";
import "dotenv/config";

const {
  PRIVATE_KEY,
  POLYGONSCAN_API_KEY,
} = process.env;

task("deploy", "Deploy contract, use --contract <address> [--args <constructor-args>]'")
  .addParam("contract", "Contract name")
  .addOptionalParam("args", "Contract construtor arguments")
  .setAction(async (taskArgs, hre) => {
    const [deployer] = await hre.ethers.getSigners();

    console.log(`Deploying contracts with the account:, ${deployer.address}`);

    console.log(`Account balance:, ${(await deployer.getBalance()).toString()}`);

    const Token = await hre.ethers.getContractFactory(taskArgs.contract);
    //@ts-ignore
    const token = taskArgs.args ? await Token.deploy(taskArgs.args) : await Token.deploy()

    console.log(`Contract address:, ${token.address}`);
  });

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
