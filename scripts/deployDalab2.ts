import { ethers } from 'hardhat';

const main = async () => {
  const Badge = await ethers.getContractFactory('HenkakuBadge');
  const henkakuToken = process.env.TOKEN_ADDRESS
  const fundsAddress = '0xC348F9d0Fa9cc7283c7cafAF6D24F18FdFE28cA3'
  const badgeContract = await Badge.deploy(henkakuToken, fundsAddress);
  await badgeContract.deployed()
  console.log('badge contract', badgeContract.address)

  const badgeArgs = {
    mintable: true,
    transferable: true,
    amount: 0,
    maxSupply: 20,
    tokenURI: 'https://bafkreiflijldxjpx5xcx55cjm44o6cg3o7bgjo2hxebdt5nttscihwsq4m.ipfs.w3s.link/?filename=delotie.json',
    maxMintPerWallet: 1,
  };
  await badgeContract.createBadge(badgeArgs);
  await badgeContract.transferOwnership('0xC348F9d0Fa9cc7283c7cafAF6D24F18FdFE28cA3')
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
