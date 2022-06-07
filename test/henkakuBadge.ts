import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";

describe("HenkakuBadge", function () {
  let BadgeContract: any,
    badgeContract: Contract,
    owner: Signer,
    alice: Signer,
    bob: Signer;

  beforeEach(async () => {
    /*eslint no-unused-vars: "warn"*/
    [owner, alice, bob] = await ethers.getSigners();
    BadgeContract = await ethers.getContractFactory("HenkakuBadge");
    badgeContract = await BadgeContract.deploy();
    await badgeContract.deployed();
  });

  describe("createBadge", () => {
    it("creates badges", async () => {
      const badgeArgs = {
        mintable: true,
        transerable: false,
        amount: ethers.utils.parseUnits("100", 18),
        tokenURI: "https://example.com",
      };

      await expect(badgeContract.createBadge(badgeArgs))
        .to.emit(badgeContract, "NewBadge")
        .withArgs(1, badgeArgs.mintable, badgeArgs.amount);
      const badge = await badgeContract.bages(1);
      expect(badge.mintable).to.eq(badgeArgs.mintable);
      expect(badge.transerable).to.eq(badgeArgs.transerable);
      expect(badge.amount).to.eq(badgeArgs.amount);
      expect(badge.tokenURI).to.eq(badgeArgs.tokenURI);

      await expect(badgeContract.createBadge(Object.values(badgeArgs)))
        .to.emit(badgeContract, "NewBadge")
        .withArgs(2, badgeArgs.mintable, badgeArgs.amount);
      const anotherBadge = await badgeContract.bages(2);
      expect(anotherBadge.mintable).to.eq(badgeArgs.mintable);
      expect(anotherBadge.transerable).to.eq(badgeArgs.transerable);
      expect(anotherBadge.amount).to.eq(badgeArgs.amount);
      expect(anotherBadge.tokenURI).to.eq(badgeArgs.tokenURI);
    });

    it("reverts with not owner", async () => {
      const badgeArgs = {
        mintable: true,
        transerable: false,
        amount: ethers.utils.parseUnits("100", 18),
        tokenURI: "https://example.com",
      };

      await expect(badgeContract.connect(alice).createBadge(badgeArgs)).to.be
        .reverted;
    });
  });
});
