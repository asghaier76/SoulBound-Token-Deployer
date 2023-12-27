import { ethers } from 'hardhat';
import { SoulBoundToken } from '../typechain-types';

async function main() {

  const [sender] = await ethers.getSigners();

  /**
   * @dev retrieve and display address, chain
   */
  const thisAddr = await sender.getAddress();
  const chainId = (await ethers.provider.getNetwork()).chainId;
  console.log(`Deployer account ${chainId}:${thisAddr}`);

  const SoulBoundToken = await ethers.getContractFactory("SoulBoundToken");
  const sbtTokenContract = await SoulBoundToken.attach(process.env.SBT_TOKEN_CONTRACT as string) as unknown as SoulBoundToken;

  console.log("SoulBoundToken Contract was attached to: ", await sbtTokenContract.getAddress());


  // To force hardhat to mine blocks on interval basis rather than default event based mining
  // if (chainId == 1337) {
  //   await ethers.provider.send('evm_setIntervalMining', [5000]);
  // }

  console.log('Minting SBT Token ...');

  const owner = process.env.OWNER_ADDRESS as string;
  
  let tx;
  tx = await sbtTokenContract.safeMint(owner);
  await tx.wait();

  // deploy complete!
  console.log(`SoulBoundToken Mint completed at txn ${tx.hash}\n`);

};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});