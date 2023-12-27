// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract SoulBoundToken is ERC721, AccessControl {
    error NonTransferableToken(uint256 tokenId);
    error NonTokenOwner(address sender, uint256 tokenId);
    
    uint256 private _tokenIdCounter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor(string memory _name, string memory _symbol, address _admin, address _minter) ERC721(_name, _symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(MINTER_ROLE, _minter);
    }

    function safeMint(address to) public onlyRole(MINTER_ROLE) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _safeMint(to, tokenId);
    }

    function burn(uint256 tokenId) external {
        if(ownerOf(tokenId) != msg.sender) {
            revert NonTokenOwner(msg.sender, tokenId); 
        }
        super._burn(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _update(address to, uint256 tokenId, address auth) internal override(ERC721) returns (address) {
        address from = _ownerOf(tokenId);
        if(!(from == address(0) || to == address(0))) {
            revert NonTransferableToken(tokenId);
        }
        return super._update(to, tokenId, auth);
    }
}