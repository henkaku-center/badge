import { ethers } from 'hardhat';

const main = async () => {
  const Badge = await ethers.getContractFactory('HenkakuBadge');
  const badgeContract = await Badge.attach('0x2C3530B4642ff8fCEb6ab5Fc740381a358968aF1');
  console.log('badge contract', badgeContract.address)

  const book = {
    mintable: true,
    transferable: false,
    amount: ethers.utils.parseUnits('1000', 18),
    maxSupply: 20,
    tokenURI: 'https://bafybeienzcfnwqqw55wzjipfod2vhnubj7f3ektmew6rgsdceiea5fe6uq.ipfs.dweb.link/joi-book-1.json',
    maxMintPerWallet: 1,
  };

  await badgeContract.updateBadgeAttr(1, book.mintable, book.tokenURI);
  console.log('finish updating')
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
