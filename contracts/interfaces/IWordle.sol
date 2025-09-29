// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IWordle {
    event WordGuessed(address indexed player, string guess, bool correct, uint256 score);
    event PollCreated(uint256 pollId, string question);
    event NFTMinted(address indexed player, uint256 tokenId);

    function submitGuess(string calldata guess) external returns (bool correct, uint256 score);
    function createPoll(string calldata question, uint256 endTime) external;
    function vote(uint256 pollId, uint256 choice) external;
    function mintGuessNFT(string calldata guess, uint256 score) external returns (uint256);
    function getPlayerRank(address player) external view returns (uint256);
}
