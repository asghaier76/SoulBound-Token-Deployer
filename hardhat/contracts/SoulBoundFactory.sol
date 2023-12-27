// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {SoulBoundToken} from "./SoulBoundToken.sol";

/**
 * The contract factory that deploys SoulBound contracts.
 *
 */
contract SoulBoundFactory {
    event ContractDeployed(address indexed ownerAddress, address indexed contractAddress);

    /**
     * Deploys a new SoulBoundToken contract using create2 for deterministic address.
     *
     * @param _name The name of the token.
     * @param _symbol The symbol of the token.
     * @param _owner The address that will have default admin role.
     * @param _minter The address that will mint the tokens.
     * @param salt A unique salt value for create2.
     */
    function deployContract(
        string memory _name, 
        string memory _symbol,
        address _owner, 
        address _minter, 
        bytes32 salt
    ) external {
        bytes memory bytecode = abi.encodePacked(
            type(SoulBoundToken).creationCode, 
            abi.encode(_name, _symbol, _owner, _minter)
        );
        address contractAddress = Create2.deploy(0, salt, bytecode);
        emit ContractDeployed(msg.sender, contractAddress);
    }
}
