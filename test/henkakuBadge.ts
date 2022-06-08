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
      const badge = await badgeContract.badges(1);
      expect(badge.mintable).to.eq(badgeArgs.mintable);
      expect(badge.transerable).to.eq(badgeArgs.transerable);
      expect(badge.amount).to.eq(badgeArgs.amount);
      expect(badge.tokenURI).to.eq(badgeArgs.tokenURI);

      await expect(badgeContract.createBadge(Object.values(badgeArgs)))
        .to.emit(badgeContract, "NewBadge")
        .withArgs(2, badgeArgs.mintable, badgeArgs.amount);
      const anotherBadge = await badgeContract.badges(2);
      expect(anotherBadge.mintable).to.eq(badgeArgs.mintable);
      expect(anotherBadge.transerable).to.eq(badgeArgs.transerable);
      expect(anotherBadge.amount).to.eq(badgeArgs.amount);
      expect(anotherBadge.tokenURI).to.eq(badgeArgs.tokenURI);
    });

    it("reverts with none owner", async () => {
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

  describe("updateBadge", () => {
    beforeEach(async () => {
      const badgeArgs = {
        mintable: true,
        transerable: false,
        amount: ethers.utils.parseUnits("100", 18),
        tokenURI: "https://example.com",
      };
      await badgeContract.createBadge(badgeArgs);
    });

    it("updates Badge", async () => {
      await expect(
        badgeContract.updateBadgeAttr(1, false, "https//hoge.com")
      ).to.emit(badgeContract, "UpdateBadge");
      const badge = await badgeContract.badges(1);
      expect(badge.mintable).to.eq(false);
      expect(badge.transerable).to.eq(false);
      expect(badge.amount).to.eq(ethers.utils.parseUnits("100", 18));
      expect(badge.tokenURI).to.eq("https//hoge.com");
    });

    it("reverts with non existed badge", async () => {
      await expect(
        badgeContract.updateBadgeAttr(0, false, "https//hoge.com")
      ).to.revertedWith("Badge Not Exists");
      await expect(
        badgeContract.updateBadgeAttr(10, false, "https//hoge.com")
      ).to.revertedWith("Badge Not Exists");
    });

    it("reverts with none owner", async () => {
      const badgeArgs = {
        mintable: true,
        transerable: false,
        amount: ethers.utils.parseUnits("100", 18),
        tokenURI: "https://example.com",
      };

      await expect(
        badgeContract.connect(bob).updateBadgeAttr(0, false, "https//hoge.com")
      ).to.be.reverted;
    });
  });
});
