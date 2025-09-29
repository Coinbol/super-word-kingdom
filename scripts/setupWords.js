const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

async function main() {
    const words = ["apple", "brave", "crane", "doubt", "eagle", "smile", "happy"];
    const leaves = words.map(word => keccak256(word));
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const root = tree.getHexRoot();
    console.log("Root:", root);
}
main();
