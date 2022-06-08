import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

describe("HenkakuBadge", function () {
  let badgeContract: Contract,
    owner: SignerWithAddress,
    alice: SignerWithAddress,
    bob: SignerWithAddress,
    erc20: Contract;

  beforeEach(async () => {
    [owner, alice, bob] = await ethers.getSigners();
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    erc20 = await MockERC20.deploy();
    await erc20.deployed();

    const BadgeContract = await ethers.getContractFactory("HenkakuBadge");
    badgeContract = await BadgeContract.deploy(erc20.address);
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
      await expect(
        badgeContract.connect(bob).updateBadgeAttr(0, false, "https//hoge.com")
      ).to.be.reverted;
    });
  });

  describe('setERC20', () => {
    beforeEach(async () => {
      const badgeArgs = {
        mintable: true,
        transerable: false,
        amount: ethers.utils.parseUnits("100", 18),
        tokenURI: "https://example.com",
      };
      await badgeContract.createBadge(badgeArgs);
    });


    it('setErc20 successfully', async () => {
      await badgeContract.setERC20(ethers.constants.AddressZero)
      expect(await badgeContract.erc20()).to.be.eq(ethers.constants.AddressZero)
    })


    it("reverts with none owner", async () => {
      await expect(
        badgeContract.connect(alice).setERC20(ethers.constants.AddressZero)
      ).to.be.reverted;
      expect(await badgeContract.erc20()).to.be.eq(erc20.address)
    })
  })

  describe('mint', () => {
    beforeEach(async () => {
      const badgeArgs = {
        mintable: true,
        transerable: false,
        amount: ethers.utils.parseUnits("100", 18),
        tokenURI: "https://example.com",
      };
      await badgeContract.createBadge(badgeArgs);
    });

    it('mint successfully', async () => {
      await erc20.approve(badgeContract.address, ethers.utils.parseUnits('10000', 18))
      await badgeContract.mint(1)
      expect(await badgeContract.balanceOf(owner.address, 1)).to.be.eq(1)
    })

    it('reverts with insufficient amount', async () => {
      await erc20.connect(alice).approve(badgeContract.address, ethers.utils.parseUnits('10000', 18))
      await expect(badgeContract.connect(alice).mint(1)).to.be.revertedWith('INSUFFICIENT BALANCE')
      expect(await badgeContract.connect(alice).balanceOf(alice.address, 1)).to.be.eq(0)
    })

    it("reverts with non existed badge", async () => {
      await erc20.approve(badgeContract.address, ethers.utils.parseUnits('10000', 18))
      await expect(
        badgeContract.mint(0)
      ).to.revertedWith("Badge Not Exists");
      await expect(
        badgeContract.mint(10)
      ).to.revertedWith("Badge Not Exists");
    });
  })
});
