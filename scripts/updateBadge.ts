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
    tokenURI: 'https://bafkreibpzhoj32pmacmxydzy6jp6yl2kmpzymkozbofmt2qigkpxbgu56u.ipfs.dweb.link/?filename=joi-book-1.json',
    maxMintPerWallet: 1,
  };

  const welcomeBadge = {
    mintable: true,
    transferable: true,
    amount: ethers.utils.parseUnits('100', 18),
    maxSupply: 2500,
    tokenURI: 'https://bafkreiao42z7kyk3qf3gztcoffo7h4haqguucfwaofau2qizwtypq7t44q.ipfs.dweb.link/?filename=welcome-to-henkaku.json',
    maxMintPerWallet: 3,
  };


  await badgeContract.updateBadgeAttr(1, book.mintable, book.tokenURI);
  await badgeContract.updateBadgeAttr(2, welcomeBadge.mintable, welcomeBadge.tokenURI);
  console.log('finish updating')
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
