const { ethers } = require("hardhat");

async function main() {
    const root = "0x123..."; // Merkle root (setupWords.js'den al)
    const SuperEncryptedWordle = await ethers.getContractFactory("SuperEncryptedWordle");
    const contract = await SuperEncryptedWordle.deploy(root);
    await contract.waitForDeployment();
    console.log("Contract deployed:", await contract.getAddress());
}
main();
