const hre = require("hardhat");

async function main() {
  const contractAddress = "0xYOUR_DEPLOYED_CONTRACT_ADDRESS";  // deploy.js'den al
  const constructorArgs = [];  // Eğer args varsa ekle

  console.log("Verifying contract at:", contractAddress);

  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArgs,
    });
    console.log("Verification successful!");
  } catch (error) {
    console.error("Verification failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
