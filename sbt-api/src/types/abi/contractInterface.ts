import * as sbtToken from './contracts/SoulBoundToken.sol/SoulBoundToken.json';
import * as sbtFactory from './contracts/SoulBoundFactory.sol/SoulBoundFactory.json';

/**
 * Retrieves the ABI interface of the contract based on the type.
 *
 * @param type - Specify if the factory or token contract is requested. The default is 'factory'.
 * @returns The contract interface.
 */
export const getContractInterface = (type: 'factory' | 'token' = 'factory') => {
  return type === 'factory' ? sbtFactory : sbtToken;
};
