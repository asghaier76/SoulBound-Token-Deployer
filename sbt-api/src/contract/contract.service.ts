import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateContractDto } from './dto/create-contract.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Chains, Networks } from 'src/types/enums';
import { getContractInterface } from 'src/types/abi/contractInterface';
import { AlchemyProvider, Contract, randomBytes } from 'ethers';
import { MintTokenDto } from './dto/mint-token.dto';
import { PrismaError } from 'src/prisma/prisma.errors';
import { Prisma } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { retrieveWallet } from 'src/user/utils/wallet-key-util';

const CONTRACT_DEPLYED_EVENT =
  '0x33c981baba081f8fd2c52ac6ad1ea95b6814b4376640f55689051f6584729688';
@Injectable()
export class ContractService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async deployContract(contract: CreateContractDto, userId: string) {
    try {
      const { contractAddress, deployerAddress } =
        await this.deployUsingFactory(contract, userId);
      const result = await this.prisma.contract.create({
        data: {
          name: contract.name,
          symbol: contract.symbol,
          chain: contract.chain,
          network: contract.network,
          userId,
          contractAddress,
          deployerAddress,
        },
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async mintToken(mintRequest: MintTokenDto, userId: string) {
    try {
      await this.prisma.contract.findFirstOrThrow({
        where: {
          chain: mintRequest.chain as string,
          network: mintRequest.network as string,
          contractAddress: mintRequest.contractAddress,
          userId,
        },
      });

      const response = await this.callContractMethod(
        userId,
        mintRequest.chain.toLowerCase() as Chains,
        mintRequest.network.toLowerCase() as Networks,
        mintRequest.contractAddress,
        'safeMint',
        [mintRequest.walletAddress],
      );
      return { ...response, address: mintRequest.walletAddress };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error?.code === PrismaError.RecordDoesNotExist
      ) {
        throw new HttpException(
          'No contract record exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async callContractMethod(
    userId: string,
    chain: Chains,
    network: Networks,
    address: string,
    methodName: string,
    args: any[],
  ) {
    try {
      const signer = await this.getSigner(chain, network, userId);

      const tokenContract = new Contract(
        address,
        getContractInterface('token'),
        signer,
      );

      const transaction = await tokenContract[methodName](...args);
      const receipt = await transaction.wait();
      return { txnHash: receipt.hash, blockNumber: receipt.blockNumber };
    } catch (error) {
      throw error;
    }
  }

  async deployUsingFactory(contractObject: CreateContractDto, userId: string) {
    try {
      const chain = contractObject.chain.toLowerCase() as Chains;
      const network = contractObject.network.toLowerCase() as Networks;
      const signer = await this.getSigner(chain, network, userId);

      const factoryContract = new Contract(
        process.env.FACTORY_CONTRACT_ADDRESS,
        getContractInterface('factory'),
        signer,
      );

      const transaction = await factoryContract.deployContract(
        contractObject.name,
        contractObject.symbol,
        signer.address,
        signer.address,
        randomBytes(32),
      );

      const receipt = await transaction.wait();

      const event = receipt?.logs.find(
        (log) => log.topics[0] === CONTRACT_DEPLYED_EVENT,
      );

      const contractAddress = event?.args[1];

      return { contractAddress, deployerAddress: signer.address };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Returns Ethers' web3 JSON RPC API provider for the correct chain and network
   *
   * @param chain The blockchain
   * @param network The network for the blockchain
   *
   */
  getEthersProvider(chain: Chains, network: Networks) {
    let providerNetwork;

    if (chain === Chains.ETHEREUM) {
      providerNetwork = network === Networks.MAINNET ? 'homestead' : 'seplia';
    } else if (chain === Chains.POLYGON) {
      providerNetwork = network === Networks.MAINNET ? 'matic' : 'maticmum';
    } else {
      throw new Error('Chain and network are not supported');
    }

    return new AlchemyProvider(providerNetwork, process.env.ALCHEMY_API_KEY);
  }

  async getSigner(chain: Chains, network: Networks, userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new HttpException(
        'No contract record exists',
        HttpStatus.BAD_REQUEST,
      );
    }
    const wallet = await retrieveWallet(user.key);
    const provider = this.getEthersProvider(chain, network);
    return wallet.connect(provider);
  }
}
