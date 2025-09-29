const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("SuperEncryptedWordle", function () {
    async function deployFixture() {
        const root = "0x123...";
        const SuperEncryptedWordle = await ethers.deployContract("SuperEncryptedWordle", [root]);
        const [owner, player1, player2] = await ethers.getSigners();
        return { SuperEncryptedWordle, owner, player1, player2 };
    }

    it("Kelime, sohbet, oylama, pazar", async function () {
        const { SuperEncryptedWordle, player1, player2 } = await loadFixture(deployFixture);
        await SuperEncryptedWordle.connect(player1).submitWord(1, [[1],[2],[3],[4]], [[],[],[],[]]);
        const tx = await SuperEncryptedWordle.connect(player1).createGroup([player1.address, player2.address]);
        const groupId = await tx.value;
        await SuperEncryptedWordle.connect(player1).broadcastGroupMessage(groupId, [[8],[9]], [[],[]]);
        await SuperEncryptedWordle.connect(player1).createPoll(groupId, "Test?", 3600);
        await SuperEncryptedWordle.connect(player1).castVote(1, [1], []);
        await SuperEncryptedWordle.connect(player1).startAuction(1, 3600);
        await SuperEncryptedWordle.connect(player2).placeBid(1, [10], [], { value: ethers.parseEther("10") });
        expect(await SuperEncryptedWordle.getCurrentHighestBid(1)).to.equal(10);
    });
});
