import { ethers } from 'hardhat';

const main = async () => {
  const Badge = await ethers.getContractFactory('HenkakuBadge');
  const henkakuToken = process.env.TOKEN_ADDRESS
  const fundsAddress = process.env.FUND_ADDRESS
  const badgeContract = await Badge.deploy(henkakuToken, fundsAddress);
  await badgeContract.deployed()
  console.log('badge contract', badgeContract.address)

  const book = {
    mintable: true,
    transferable: false,
    amount: ethers.utils.parseUnits('1000', 18),
    maxSupply: 20,
    tokenURI: 'https://bafybeidnozb7egslnmfaih6zmkmops6n32k3l3z5pl6o2tyven4fxuakni.ipfs.dweb.link/joi-book-1.json',
    maxMintPerWallet: 1,
  };

  const welcomeBadge = {
    mintable: true,
    transferable: true,
    amount: ethers.utils.parseUnits('100', 18),
    maxSupply: 2500,
    tokenURI: 'https://bafybeif27tgjwiifenis4ma7vciwzjyh5ss5yuamiy63u2gjsnhzbqw7y4.ipfs.dweb.link/welcome-to-henkaku.json',
    maxMintPerWallet: 3,
  };

  await badgeContract.createBadge(book);
  await badgeContract.createBadge(welcomeBadge);
  console.log('added badgees')
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
