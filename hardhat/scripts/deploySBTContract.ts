import { ethers } from 'hardhat';
import { SoulBoundFactory } from '../typechain-types';

async function main() {

  const [sender] = await ethers.getSigners();

  /**
   * @dev retrieve and display address, chain
   */
  const thisAddr = await sender.getAddress();
  const chainId = (await ethers.provider.getNetwork()).chainId;
  console.log(`Deployer account ${chainId}:${thisAddr}`);

  const SoulBoundFactory = await ethers.getContractFactory("SoulBoundFactory");
  const sbtFactoryContract = await SoulBoundFactory.attach(process.env.SBT_FACTORY_CONTRACT as string) as unknown as SoulBoundFactory;

  console.log("SoulBoundFactory Contract was attached to: ", await sbtFactoryContract.getAddress());


  // To force hardhat to mine blocks on interval basis rather than default event based mining
  // if (chainId == 1337) {
  //   await ethers.provider.send('evm_setIntervalMining', [5000]);
  // }

  console.log('deploying SBT Token contract...');
  const salt = ethers.randomBytes(32);    
  const name = "SoulBound Badge";
  const symbol = "SBB";
  const owner = process.env.OWNER_ADDRESS as string;
  const minter = process.env.MINTER_ADDRESS as string;
  
  let tx;
  tx = await sbtFactoryContract.deployContract(name, symbol, owner, minter, salt);
  await tx.wait();

  // deploy complete!
  console.log(`SoulBoundToken Contract completed at txn ${tx.hash}\n`);

};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});