import { ethers } from 'hardhat';

const main = async () => {
  const Badge = await ethers.getContractFactory('HenkakuBadge');
  const henkakuToken = '0xd59FFEE93A55F67CeD0F56fa4A991d4c8c8f5C4E'
  const badgeContract = await Badge.deploy(henkakuToken);
  await badgeContract.deployed()
  console.log('badge contract', badgeContract.address)

  const badgeArgs = {
    mintable: true,
    transferable: true,
    amount: 0,
    maxSupply: 20,
    tokenURI: 'https://omise.henkaku.org/metadata/dalabws1.json',
    maxMintPerWallet: 1,
  };

  await badgeContract.createBadge(badgeArgs);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
