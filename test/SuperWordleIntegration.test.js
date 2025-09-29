const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SuperWordle Integration Tests", function () {
  let wordle, owner, player;

  beforeEach(async function () {
    [owner, player] = await ethers.getSigners();
    const Wordle = await ethers.getContractFactory("SuperEncryptedWordle");
    wordle = await Wordle.deploy();
    await wordle.waitForDeployment();
  });

  it("Should deploy and allow a guess", async function () {
    await expect(wordle.connect(player).submitGuess("hello")).to.emit(wordle, "WordGuessed").withArgs(player.address, "hello", false, 0);
    const rank = await wordle.getPlayerRank(player.address);
    expect(rank).to.equal(0);  // Varsayılan
  });

  it("Should create a poll and vote", async function () {
    await expect(wordle.connect(owner).createPoll("Best word?", Math.floor(Date.now() / 1000) + 3600))
      .to.emit(wordle, "PollCreated")
      .withArgs(0, "Best word?");
    await wordle.connect(player).vote(0, 1);
  });

  it("Should mint NFT for correct guess", async function () {
    // Varsayalım doğru kelime "world"
    await wordle.connect(owner).setSecretWord("world");  // Owner set etsin
    const tx = await wordle.connect(player).submitGuess("world");
    await tx.wait();
    await expect(wordle.connect(player).mintGuessNFT("world", 100)).to.emit(wordle, "NFTMinted");
  });
});
