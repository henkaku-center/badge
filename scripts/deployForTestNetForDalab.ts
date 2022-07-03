import { ethers } from 'hardhat';

const main = async () => {
  const Badge = await ethers.getContractFactory('HenkakuBadge');
  const henkakuToken = '0x02Dd992774aBCacAD7D46155Da2301854903118D'
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

  // await badgeContract.transferOwnership('0xF3fb03B582bd19CfA6728FDED7e130aad396d99E')
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
