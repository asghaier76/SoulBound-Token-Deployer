import { Injectable } from '@nestjs/common';
import { CreateContractDto } from './dto/create-contract.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Chains, Networks } from 'src/types/enums';
import { getContractInterface } from 'src/types/abi/contractInterface';
import { AlchemyProvider, Contract, Wallet, randomBytes } from 'ethers';

const CONTRACT_DEPLYED_EVENT =
  '0x33c981baba081f8fd2c52ac6ad1ea95b6814b4376640f55689051f6584729688';
@Injectable()
export class ContractService {
  constructor(private prisma: PrismaService) {}

  async deployContract(contract: CreateContractDto, userId: string) {
    try {
      const { contractAddress, deployerAddress } =
        await this.deployUsingFactory(contract);
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

  async deployUsingFactory(contractObject: CreateContractDto) {
    try {
      const chain = contractObject.chain.toLowerCase() as Chains;
      const network = contractObject.network.toLowerCase() as Networks;
      const signer = this.getSigner(chain, network);

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

  getSigner(chain: Chains, network: Networks) {
    if (!process.env.PRIVATE_KEY) {
      const message = 'The application private key is not provided';
      // this.logger.error(message);
      throw new Error(message);
    }

    const wallet = new Wallet(process.env.PRIVATE_KEY);
    const provider = this.getEthersProvider(chain, network);
    return wallet.connect(provider);
  }
}
