// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint32, externalEuint8, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { MerkleProof } from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract SuperEncryptedWordle is SepoliaConfig, ERC721("Şifreli Kelime NFT", "SKNFT") {
    bytes32 public rootHash;
    uint256 public nextTokenId = 1;

    // Kelime Oyunu
    mapping(address => euint32[7]) public playerWords;
    mapping(address => euint32) public playerScores;
    euint32 public globalLeaderboard;

    // Grup Sohbeti
    struct Group {
        address[] members;
        euint8[][] messages;
        euint32 messageCount;
        mapping(address => bool) isMember;
    }
    mapping(uint256 => Group) public groups;
    uint256 public nextGroupId = 1;

    // Oylama Salonu
    struct Poll {
        string question;
        euint32 yesVotes;
        euint32 noVotes;
        uint256 endTime;
        mapping(address => bool) hasVoted;
    }
    mapping(uint256 => Poll) public polls;
    mapping(uint256 => uint256[]) public groupPolls;
    uint256 public nextPollId = 1;

    // Gizli Pazar
    struct Auction {
        uint256 nftId;
        euint32 highestBid;
        address highestBidder;
        uint256 endTime;
        mapping(address => euint32) bids;
    }
    mapping(uint256 => Auction) public auctions;
    uint256 public nextAuctionId = 1;

    event GameWin(address player, euint32 score);
    event GroupMessageBroadcast(uint256 groupId, address sender, euint32 msgId);
    event PollCreated(uint256 pollId, string question);
    event VoteCast(uint256 pollId, euint8 vote);
    event AuctionStarted(uint256 auctionId, uint256 nftId);
    event BidPlaced(uint256 auctionId, euint32 bid);
    event AuctionEnded(uint256 auctionId, address winner, euint32 winningBid);

    constructor(bytes32 _rootHash) {
        rootHash = _rootHash;
    }

    function submitWord(uint8 level, externalEuint8[] calldata encryptedLetters, bytes[] calldata proofs) external {
        require(level >= 1 && level <= 7, "Seviye 1-7!");
        require(encryptedLetters.length == level + 3, "Kelime uzunlugu seviye kadar!");
        uint256 wordCode = encodeWord(encryptedLetters);
        require(MerkleProof.verify(proofs, rootHash, keccak256(abi.encodePacked(wordCode))), "Kelime listede yok!");
        
        euint32 scoreBoost = calculateScore(encryptedLetters);
        playerWords[msg.sender][level-1] = FHE.asEuint32(FHE.sum(FHE.asEuint32Array(encryptedLetters)));
        playerScores[msg.sender] = FHE.add(playerScores[msg.sender], scoreBoost);
        FHE.allowThis(playerScores[msg.sender]);
        FHE.allow(playerScores[msg.sender], msg.sender);
        
        globalLeaderboard = FHE.max(globalLeaderboard, playerScores[msg.sender]);
        if (FHE.eq(playerScores[msg.sender], globalLeaderboard)) {
            _safeMint(msg.sender, nextTokenId++);
            emit GameWin(msg.sender, playerScores[msg.sender]);
        }
    }

    function createGroup(address[] calldata initialMembers) external returns (uint256) {
        uint256 groupId = nextGroupId++;
        Group storage group = groups[groupId];
        group.messageCount = FHE.asEuint32(0);
        for (uint i = 0; i < initialMembers.length; i++) {
            if (initialMembers[i] != address(0) && !group.isMember[initialMembers[i]]) {
                group.members.push(initialMembers[i]);
                group.isMember[initialMembers[i]] = true;
            }
        }
        require(group.members.length >= 2, "En az 2 uye!");
        return groupId;
    }

    function broadcastGroupMessage(uint256 groupId, externalEuint8[] calldata encryptedMessage, bytes[] calldata proofs) external {
        Group storage group = groups[groupId];
        require(group.isMember[msg.sender], "Kulube uye ol!");
        require(encryptedMessage.length <= 100, "Mesaj kisa olsun!");
        
        euint32 newId = FHE.add(group.messageCount, FHE.asEuint32(1));
        group.messageCount = newId;
        
        euint8[] memory fullMsg = new euint8[](encryptedMessage.length + 1);
        fullMsg[0] = FHE.asEuint8(uint8(uint160(msg.sender) % 256));
        for (uint i = 0; i < encryptedMessage.length; i++) {
            fullMsg[i+1] = FHE.fromExternal(encryptedMessage[i], proofs[i]);
        }
        group.messages.push(fullMsg);
        
        for (uint j = 0; j < group.members.length; j++) {
            FHE.allowThis(group.messages[group.messages.length - 1]);
            FHE.allow(group.messages[group.messages.length - 1], group.members[j]);
        }
        emit GroupMessageBroadcast(groupId, msg.sender, newId);
    }

    function readGroupMessages(uint256 groupId, uint32 startId, uint32 length) external view returns (euint8[][] memory) {
        Group storage group = groups[groupId];
        require(group.isMember[msg.sender], "Sadece uyeler okur!");
        euint8[][] memory msgs = new euint8[][](length);
        uint index = 0;
        for (uint i = startId; i < startId + length && i < group.messages.length; i++) {
            msgs[index] = group.messages[i];
            index++;
        }
        return msgs;
    }

    function createPoll(uint256 groupId, string calldata question, uint256 durationSeconds) external {
        require(groups[groupId].isMember[msg.sender], "Sadece uyeler soru sorar!");
        uint256 pollId = nextPollId++;
        Poll storage poll = polls[pollId];
        poll.question = question;
        poll.yesVotes = FHE.asEuint32(0);
        poll.noVotes = FHE.asEuint32(0);
        poll.endTime = block.timestamp + durationSeconds;
        groupPolls[groupId].push(pollId);
        emit PollCreated(pollId, question);
    }

    function castVote(uint256 pollId, externalEuint8 calldata encryptedVote, bytes calldata proof) external {
        Poll storage poll = polls[pollId];
        require(block.timestamp < poll.endTime, "Oylama bitti!");
        require(!poll.hasVoted[msg.sender], "Bir kere oy ver!");
        
        euint8 vote = FHE.fromExternal(encryptedVote, proof);
        poll.hasVoted[msg.sender] = true;
        
        if (FHE.eq(vote, FHE.asEuint8(1))) {
            poll.yesVotes = FHE.add(poll.yesVotes, FHE.asEuint32(1));
        } else {
            poll.noVotes = FHE.add(poll.noVotes, FHE.asEuint32(1));
        }
        
        FHE.allowThis(poll.yesVotes);
        FHE.allowThis(poll.noVotes);
        emit VoteCast(pollId, vote);
    }

    function getPollResults(uint256 pollId) external view returns (euint32, euint32) {
        return (polls[pollId].yesVotes, polls[pollId].noVotes);
    }

    function startAuction(uint256 nftId, uint256 durationSeconds) external {
        require(ownerOf(nftId) == msg.sender, "NFT senin degil!");
        uint256 auctionId = nextAuctionId++;
        Auction storage auction = auctions[auctionId];
        auction.nftId = nftId;
        auction.highestBid = FHE.asEuint32(0);
        auction.endTime = block.timestamp + durationSeconds;
        _transfer(msg.sender, address(this), nftId);
        emit AuctionStarted(auctionId, nftId);
    }

    function placeBid(uint256 auctionId, externalEuint32 calldata encryptedBid, bytes calldata proof) external payable {
        Auction storage auction = auctions[auctionId];
        require(block.timestamp < auction.endTime, "Acik artirma bitti!");
        euint32 bid = FHE.fromExternal(encryptedBid, proof);
        require(FHE.gt(bid, auction.highestBid), "Daha yuksek teklif!");
        
        require(msg.value >= FHE.reveal(bid), "ETH yatir!");
        auction.bids[msg.sender] = bid;
        auction.highestBid = bid;
        auction.highestBidder = msg.sender;
        emit BidPlaced(auctionId, bid);
    }

    function endAuction(uint256 auctionId) external {
        Auction storage auction = auctions[auctionId];
        require(block.timestamp >= auction.endTime, "Henuz bitmedi!");
        require(auction.highestBidder != address(0), "Teklif yok!");
        
        uint256 winningAmount = FHE.reveal(auction.highestBid);
        _transfer(address(this), auction.highestBidder, auction.nftId);
        payable(msg.sender).transfer(winningAmount);
        emit AuctionEnded(auctionId, auction.highestBidder, auction.highestBid);
    }

    function encodeWord(externalEuint8[] calldata letters) internal pure returns (uint256) {
        uint256 code = 0;
        for (uint i = 0; i < letters.length; i++) {
            code = code * 26 + FHE.reveal(letters[i]);
        }
        return code;
    }

    function calculateScore(externalEuint8[] calldata letters) internal pure returns (euint32) {
        euint32 score = FHE.asEuint32(0);
        for (uint i = 0; i < letters.length; i++) {
            score = FHE.add(score, FHE.mul(FHE.fromExternal(letters[i], ""), FHE.asEuint32(2)));
        }
        return score;
    }
}
