# SoulBound Contract Hardhat Project

This project is for a simple SoulBound ERC721 NFT contract.

The project uses a factory contract that deploys the SBT token using CREATE2

The factory contract itself is also deployed using CREATE2 through hardhat xdeployer plugin

These are some of the scripts to be used to run tests or deploy the code

## Install and Compile

To start the project, first install the depenedencies

```shell
npm install
```

To compile and run tests you can use these commands

```shell
npm run compile

npm run test
```

For running coverage and seeing covrage reports

```shell
npm run test:coverage

```

## Contracts deployment

To deploy the factory contract, first make sure you have the right settings in xdeploy section in hardhat.config.ts file. The script requires the private key of the wallet to be used for deployment and Alchemy API Key, other env variables are present in .env.sample

The xdeploy section in hardhat.config.ts file also has parameters to define the targeted networks, their rpc urls and the phrase used to generate the salt. Once all set up, you need to run this command, and the deployment result will be stored in a file under deployments folder with the name of the factory contract and network, which should show the deployment transaction hash and the contract address

```shell
npm run deploy:factory

```

Once factory is deployed, the scripts for deploySBTContract and mintSBTToken can be used to deploy a new SBT contract and mint a token

```shell
npx hardhat run scripts/deploySBTContract.ts --network mumbai

npx hardhat run scripts/mintSBTToken.ts --network mumbai 

```

## Exporting Contracts ABI
For using the contracts in the app, the script export:abi will export the ABI of both contracts, factory and token contracts, to a folder types/abi

```shell
npm run exprort:abi

```
