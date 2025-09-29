require("@nomicfoundation/hardhat-toolbox");

module.exports = {
    solidity: "0.8.24",
    networks: {
        sepolia: {
            url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
            accounts: { mnemonic: process.env.MNEMONIC }
        }
    }
};
