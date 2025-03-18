// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title MedToken
 * @dev ERC20 Token for the TeleMedChain platform
 * Includes roles for administration and minting capabilities for rewards
 */
contract MedToken is ERC20, ERC20Burnable, Pausable, AccessControl {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    // Events
    event RewardMinted(address indexed to, uint256 amount, string reason);
    
    /**
     * @dev Constructor initializes the token with name and symbol
     * Sets up roles and mints initial supply to contract creator
     */
    constructor() ERC20("MedToken", "MED") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        
        // Mint initial supply - 1 million tokens
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
    
    /**
     * @dev Pauses all token transfers
     * Can only be called by accounts with PAUSER_ROLE
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpauses all token transfers
     * Can only be called by accounts with PAUSER_ROLE
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Mints tokens to a specified address
     * Can only be called by accounts with MINTER_ROLE
     * @param to Address receiving the tokens
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
    
    /**
     * @dev Mints reward tokens to a user for platform participation
     * Can only be called by accounts with MINTER_ROLE
     * @param to Address receiving the reward
     * @param amount Amount of tokens to mint as reward
     * @param reason Reason for the reward (diagnosis, verification, etc.)
     */
    function mintReward(address to, uint256 amount, string memory reason) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
        emit RewardMinted(to, amount, reason);
    }
    
    /**
     * @dev Override of the _beforeTokenTransfer function
     * Ensures transfers are only possible when the contract is not paused
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
