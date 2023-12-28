import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-solhint';
import * as dotenv from 'dotenv';
import 'hardhat-abi-exporter';
import { HardhatUserConfig } from 'hardhat/config';
import "@nomicfoundation/hardhat-verify";
import "hardhat-gas-reporter"
import 'xdeployer';

dotenv.config();


function accounts(): { mnemonic: string; accountsBalance: string } {
  return { mnemonic: 'test test test test test test test test test test test junk', accountsBalance: '100000000000000000000000000' };
}

const config = {
  solidity: {
    version: '0.8.20',
    settings: {
      evmVersion: 'paris',
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      accounts: accounts()
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY as string]
    },
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY as string]
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY as string]
    },
    mainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY as string]
    }
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGONSCAN_API_KEY as string,
      polygon: process.env.POLYGONSCAN_API_KEY as string,
      seploia: process.env.ETHERSCAN_API_KEY as string,
      mainnet: process.env.ETHERSCAN_API_KEY as string
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD'
  },
  abiExporter: {
    path: '../sbt-api/src/types/abi'
  },
  xdeploy: {
    contract: 'SoulBoundFactory',
    salt: 'SoulBoundFactorySaltPhrase',
    signer: process.env.PRIVATE_KEY,
    networks: [
      'sepolia',
      'mumbai'
    ],
    rpcUrls: [
      `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
    ],
    gasLimit: 5 * 10 ** 6
  }
} satisfies HardhatUserConfig;

export default config;
