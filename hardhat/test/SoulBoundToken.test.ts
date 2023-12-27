const { ethers } = require("hardhat");
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import { SoulBoundToken } from '../typechain-types';

describe("SoulBoundToken Contract", function () {
  let soulBoundToken: SoulBoundToken;
  let contract: any;
  let owner: SignerWithAddress;
  let minter: SignerWithAddress;
  let signers: SignerWithAddress[];

  beforeEach(async function () {
    soulBoundToken = await ethers.getContractFactory("SoulBoundToken");
    [owner, minter, ...signers] = await ethers.getSigners();
    const proxy = await ethers.getContractFactory('SoulBoundToken');
    contract = (await proxy.deploy(
        'SoulBoundToken',
        'SBT',
        owner.address,
        minter.address
    )) as unknown as SoulBoundToken;
    const sbt = contract.deploymentTransaction();
    await sbt?.wait();

  });

  describe("Deployment", function() {
    it('Should check contract name and symbol values', async () => {
        expect(await contract.name()).to.equal('SoulBoundToken');
        expect(await contract.symbol()).to.equal('SBT');
    });

    it('Should check contract default admin role assigned to deployer', async () => {
        const defaultAdminRole = await contract.DEFAULT_ADMIN_ROLE();
        expect(await contract.hasRole(defaultAdminRole, owner.address)).to.equal(true);    
    });

    it('Should check contract minter role assigned to minter', async () => {
        const minterRole = await contract.MINTER_ROLE();
        expect(await contract.hasRole(minterRole, minter.address)).to.equal(true);    
    });

  });

  describe('Interfaces', async () => {
    it('Should check that contracts supports ERC721 interface', async () => {
      const ERC721Interface = '0x80ac58cd';
      expect(await contract.supportsInterface(ERC721Interface)).to.equal(true);
    });

    it('Should check that contracts supports ERC165 interface', async () => {
      const ERC165Interface = '0x01ffc9a7';
      expect(await contract.supportsInterface(ERC165Interface)).to.equal(true);
    });

    it('Should check that contracts supports AccessControl interface', async () => {
      const AccessControlInterface = '0x7965db0b';
      expect(await contract.supportsInterface(AccessControlInterface)).to.equal(true);
    });
  });

  describe("Minting", function () {
    it("Should mint a new token to a specified address", async function () {
      await expect(contract.connect(minter).safeMint(signers[0].address))
        .to.emit(contract, 'Transfer')
        .withArgs("0x0000000000000000000000000000000000000000", signers[0].address, 0);
      expect(await contract.ownerOf(0)).to.equal(signers[0].address);
    });

    it("Should only allow the owner to mint tokens", async function () {
      const minterRole = await contract.MINTER_ROLE();
      await expect(contract.connect(signers[0]).safeMint(signers[0].address))
        .to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount")
        .withArgs(signers[0].address, minterRole);
    });

  });

  describe("Burning", function () {
    beforeEach(async function () {
      await contract.connect(minter).safeMint(signers[1].address);
    });

    it("Should prevent non-owners from burning the token", async function () {
        await expect(contract.connect(signers[2]).burn(0))
            .to.be.revertedWithCustomError(contract, "NonTokenOwner")
            .withArgs(signers[2].address, 0);
    });

    it("Should allow the token owner to burn the token", async function () {
      await expect(contract.connect(signers[1]).burn(0))
        .to.emit(contract, 'Transfer')
        .withArgs(signers[1].address, "0x0000000000000000000000000000000000000000", 0);
    });

  });

  describe("Transfering", function () {
    beforeEach(async function () {
      await contract.connect(minter).safeMint(signers[2].address);
    });

    it("Should prevent owners from transfer SBT token, using transferFrom", async function () {
        await expect(contract.connect(signers[2]).transferFrom(signers[2].address, signers[3].address, 0))
            .to.be.revertedWithCustomError(contract, "NonTransferableToken")
            .withArgs(0);
    });
    
    it("Should prevent owners from transfer SBT token, using safeTransferFrom", async function () {
        await expect(contract.connect(signers[2]).safeTransferFrom(signers[2].address, signers[3].address, 0))
            .to.be.revertedWithCustomError(contract, "NonTransferableToken")
            .withArgs(0);
    });

  });

});
