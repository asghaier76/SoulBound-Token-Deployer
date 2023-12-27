import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { SoulBoundFactory, SoulBoundToken } from '../typechain-types';

describe('SoulBoundFactory Deployer Testing', async () => {
  // Contract deployment fixture to run setup once, snapshot state, and load for every test
  let contract: SoulBoundFactory;
  let owner: SignerWithAddress;
  let minter: SignerWithAddress;
  let signers: SignerWithAddress[];

  beforeEach(async function () {
    [owner, minter, ...signers] = await ethers.getSigners();
    const proxy = await ethers.getContractFactory('SoulBoundFactory');
    contract = (await proxy.deploy()) as unknown as SoulBoundFactory;
    const sbtFactory = contract.deploymentTransaction();
    await sbtFactory?.wait();

  });

  describe("Deploy SoulBoundToken", function () {
    it("Should deploy a SoulBoundToken contract and check main values", async function () {
      
        const salt = ethers.randomBytes(32);    
        const tx = await contract.deployContract("SoulBoundToken", "SBT", owner.address, minter.address, salt);
        const receipt = await tx.wait(1);
        const event = receipt?.logs.find(log => log.topics[0] === "0x33c981baba081f8fd2c52ac6ad1ea95b6814b4376640f55689051f6584729688");
        expect(event).to.not.be.undefined;
        
        const sbtAddress = event?.args[1];

        const soulBoundToken = await ethers.getContractFactory("SoulBoundToken");
        const sbt = soulBoundToken.attach(sbtAddress as string) as unknown as SoulBoundToken;
  
        expect(await sbt.name()).to.equal("SoulBoundToken");
        expect(await sbt.symbol()).to.equal("SBT");

        const defaultAdminRole = await sbt.DEFAULT_ADMIN_ROLE();
        expect(await sbt.hasRole(defaultAdminRole, owner.address)).to.equal(true);    
    
        const minterRole = await sbt.MINTER_ROLE();
        expect(await sbt.hasRole(minterRole, minter.address)).to.equal(true);    

    });

  });

});
