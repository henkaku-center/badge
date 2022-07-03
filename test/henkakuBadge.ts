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
        transferable: false,
        amount: ethers.utils.parseUnits("100", 18),
        maxSupply: 10,
        tokenURI: "https://example.com",
        maxMintPerWallet: 0
      };

      await expect(badgeContract.createBadge(badgeArgs))
        .to.emit(badgeContract, "NewBadge")
        .withArgs(1, badgeArgs.mintable, badgeArgs.amount);
      const badge = await badgeContract.badges(1);
      expect(badge.mintable).to.eq(badgeArgs.mintable);
      expect(badge.transferable).to.eq(badgeArgs.transferable);
      expect(badge.amount).to.eq(badgeArgs.amount);
      expect(badge.tokenURI).to.eq(badgeArgs.tokenURI);
      expect(badge.maxSupply).to.eq(badgeArgs.maxSupply);

      await expect(badgeContract.createBadge(Object.values(badgeArgs)))
        .to.emit(badgeContract, "NewBadge")
        .withArgs(2, badgeArgs.mintable, badgeArgs.amount);
      const anotherBadge = await badgeContract.badges(2);
      expect(anotherBadge.mintable).to.eq(badgeArgs.mintable);
      expect(anotherBadge.transferable).to.eq(badgeArgs.transferable);
      expect(anotherBadge.amount).to.eq(badgeArgs.amount);
      expect(anotherBadge.tokenURI).to.eq(badgeArgs.tokenURI);
      expect(anotherBadge.maxSupply).to.eq(badgeArgs.maxSupply);
    });

    it("reverts with none owner", async () => {
      const badgeArgs = {
        mintable: true,
        transferable: false,
        amount: ethers.utils.parseUnits("100", 18),
        maxSupply: 10,
        tokenURI: "https://example.com",
        maxMintPerWallet: 0
      };

      await expect(badgeContract.connect(alice).createBadge(badgeArgs)).to.be
        .reverted;
    });
  });

  describe("updateBadge", () => {
    beforeEach(async () => {
      const badgeArgs = {
        mintable: true,
        transferable: false,
        amount: ethers.utils.parseUnits("100", 18),
        maxSupply: 10,
        tokenURI: "https://example.com",
        maxMintPerWallet: 0
      };
      await badgeContract.createBadge(badgeArgs);
    });

    it("updates Badge", async () => {
      await expect(
        badgeContract.updateBadgeAttr(1, false, "https//hoge.com")
      ).to.emit(badgeContract, "UpdateBadge");
      const badge = await badgeContract.badges(1);
      expect(badge.mintable).to.eq(false);
      expect(badge.transferable).to.eq(false);
      expect(badge.amount).to.eq(ethers.utils.parseUnits("100", 18));
      expect(badge.tokenURI).to.eq("https//hoge.com");
      expect(badge.maxSupply).to.eq(10);
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

  describe("setERC20", () => {
    beforeEach(async () => {
      const badgeArgs = {
        mintable: true,
        transferable: false,
        amount: ethers.utils.parseUnits("100", 18),
        maxSupply: 10,
        tokenURI: "https://example.com",
        maxMintPerWallet: 0
      };
      await badgeContract.createBadge(badgeArgs);
    });

    it("setErc20 successfully", async () => {
      await badgeContract.setERC20(ethers.constants.AddressZero);
      expect(await badgeContract.erc20()).to.be.eq(
        ethers.constants.AddressZero
      );
    });

    it("reverts with none owner", async () => {
      await expect(
        badgeContract.connect(alice).setERC20(ethers.constants.AddressZero)
      ).to.be.reverted;
      expect(await badgeContract.erc20()).to.be.eq(erc20.address);
    });
  });

  describe("mint", () => {
    beforeEach(async () => {
      const badgeArgs = {
        mintable: true,
        transferable: false,
        amount: ethers.utils.parseUnits("100", 18),
        maxSupply: 10,
        tokenURI: "https://example.com",
        maxMintPerWallet: 0
      };
      await badgeContract.createBadge(badgeArgs);
    });

    it("mint successfully", async () => {
      await erc20.approve(
        badgeContract.address,
        ethers.utils.parseUnits("10000", 18)
      );
      const balance = await erc20.balanceOf(owner.address);
      const mintPrice = ethers.utils.parseUnits("100", 18);
      await badgeContract.mint(1);
      expect(await badgeContract.balanceOf(owner.address, 1)).to.be.eq(1);
      expect(await badgeContract.totalSupply(1)).to.be.eq(1);
      expect(await erc20.balanceOf(owner.address)).to.be.eq(
        balance.sub(mintPrice)
      );
    });

    it("mint successfully without henkaku token", async () => {
      const badgeArgs = {
        mintable: true,
        transferable: false,
        amount: 0,
        maxSupply: 10,
        tokenURI: "https://example.com",
        maxMintPerWallet: 0
      };
      await badgeContract.createBadge(badgeArgs);
      expect(await badgeContract.totalSupply(2)).to.be.eq(0);
      await badgeContract.connect(alice).mint(2);
      expect(
        await badgeContract.connect(alice).balanceOf(alice.address, 2)
      ).to.be.eq(1);
      expect(await badgeContract.connect(alice).totalSupply(2)).to.be.eq(1);
    });

    it("reverts with insufficient amount", async () => {
      await erc20
        .connect(alice)
        .approve(badgeContract.address, ethers.utils.parseUnits("10000", 18));
      await expect(badgeContract.connect(alice).mint(1)).to.be.revertedWith(
        "INSUFFICIENT BALANCE"
      );
      expect(
        await badgeContract.connect(alice).balanceOf(alice.address, 1)
      ).to.be.eq(0);
    });

    it("reverts with non existed badge", async () => {
      await erc20.approve(
        badgeContract.address,
        ethers.utils.parseUnits("10000", 18)
      );
      await expect(badgeContract.mint(0)).to.revertedWith("Badge Not Exists");
      await expect(badgeContract.mint(10)).to.revertedWith("Badge Not Exists");
    });

    it("reverts exceed total Supply", async () => {
      const badgeArgs = {
        mintable: true,
        transferable: false,
        amount: 0,
        maxSupply: 1,
        tokenURI: "https://example.com",
        maxMintPerWallet: 0
      };
      await badgeContract.createBadge(badgeArgs);
      expect((await badgeContract.getBadges()).length).to.be.eq(2);
      await badgeContract.mint(2);
      await expect(badgeContract.mint(2)).to.revertedWith(
        "Invalid: Exceed Supply"
      );
    });
  });

  it("reverts with non existed badge", async () => {
    await erc20.approve(
      badgeContract.address,
      ethers.utils.parseUnits("10000", 18)
    );
    await expect(badgeContract.mint(0)).to.revertedWith("Badge Not Exists");
    await expect(badgeContract.mint(10)).to.revertedWith("Badge Not Exists");
  });

  describe("safeTransferFrom", () => {
    beforeEach(async () => {
      const transferableBadgeArgs = {
        mintable: true,
        transferable: true,
        amount: ethers.utils.parseUnits("100", 18),
        maxSupply: 10,
        tokenURI: "https://example.com",
        maxMintPerWallet: 0
      };
      await badgeContract.createBadge(transferableBadgeArgs);

      const nonTransferableBadgeArgs = {
        mintable: true,
        transferable: false,
        amount: ethers.utils.parseUnits("100", 18),
        maxSupply: 10,
        tokenURI: "https://example.com",
        maxMintPerWallet: 0
      };
      await badgeContract.createBadge(nonTransferableBadgeArgs);
    });

    it("safeTransferFrom successfully", async () => {
      await erc20.approve(
        badgeContract.address,
        ethers.utils.parseUnits("10000", 18)
      );
      await badgeContract.mint(1);

      await badgeContract.safeTransferFrom(
        owner.address,
        alice.address,
        1,
        1,
        []
      );

      expect(await badgeContract.balanceOf(owner.address, 1)).to.be.eq(0);
      expect(await badgeContract.balanceOf(alice.address, 1)).to.be.eq(1);
    });

    it("reverts with non existed badge", async () => {
      await erc20.approve(
        badgeContract.address,
        ethers.utils.parseUnits("10000", 18)
      );
      await expect(badgeContract.mint(0)).to.revertedWith("Badge Not Exists");
      await expect(badgeContract.mint(10)).to.revertedWith("Badge Not Exists");
    });

    it("reverts with non transferable budge", async () => {
      await erc20.approve(
        badgeContract.address,
        ethers.utils.parseUnits("10000", 18)
      );
      await badgeContract.mint(2);

      await expect(
        badgeContract.safeTransferFrom(owner.address, alice.address, 2, 1, [])
      ).to.revertedWith("TRANSFER FORBIDDEN");
    });
  });

  describe("mintByAdmin", () => {
    beforeEach(async () => {
      const badgeArgs = {
        mintable: true,
        transferable: false,
        amount: ethers.utils.parseUnits("100", 18),
        maxSupply: 10,
        tokenURI: "https://example.com",
        maxMintPerWallet: 0
      };
      await badgeContract.createBadge(badgeArgs);
    });

    it("mint successfully", async () => {
      await badgeContract.mintByAdmin(1, alice.address);
      expect(await badgeContract.balanceOf(alice.address, 1)).to.be.eq(1);
    });

    it("reverts with none owner", async () => {
      await expect(
        badgeContract.connect(alice).mintByAdmin(1, alice.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("reverts with non existed badge", async () => {
      await erc20.transfer(alice.address, ethers.utils.parseUnits("10000", 18));
      await erc20.approve(
        badgeContract.address,
        ethers.utils.parseUnits("10000", 18)
      );
      await expect(badgeContract.mintByAdmin(0, alice.address)).to.revertedWith(
        "Badge Not Exists"
      );
      await expect(
        badgeContract.mintByAdmin(10, alice.address)
      ).to.revertedWith("Badge Not Exists");
    });
  });

  describe("badges", () => {
    beforeEach(async () => {
      const badgeArgs = {
        mintable: true,
        transferable: false,
        amount: ethers.utils.parseUnits("100", 18),
        maxSupply: 10,
        tokenURI: "https://example.com",
        maxMintPerWallet: 0
      };
      await badgeContract.createBadge(badgeArgs);
    });

    it("returns badges mapping", async () => {
      expect(await badgeContract.badges(1)).to.be.eql([
        true,
        false,
        ethers.utils.parseUnits("100", 18),
        ethers.BigNumber.from(10),
        "https://example.com",
        ethers.BigNumber.from(0)
      ]);

      expect(await badgeContract.totalSupply(1)).to.be.eq(0);
    });
  });

  describe("getBadges", () => {
    beforeEach(async () => {
      const badgeArgs1 = {
        mintable: true,
        transferable: false,
        amount: ethers.utils.parseUnits("100", 18),
        maxSupply: 10,
        tokenURI: "https://example1.com",
        maxMintPerWallet: 0
      };
      await badgeContract.createBadge(badgeArgs1);
      const badgeArgs2 = {
        mintable: true,
        transferable: true,
        amount: ethers.utils.parseUnits("50", 18),
        maxSupply: 10,
        tokenURI: "https://example2.com",
        maxMintPerWallet: 0
      };
      await badgeContract.createBadge(badgeArgs2);
    });

    it("returns badges array", async () => {
      expect(await badgeContract.getBadges()).to.be.eql([
        [
          true,
          false,
          ethers.utils.parseUnits("100", 18),
          ethers.BigNumber.from(10),
          "https://example1.com",
          ethers.BigNumber.from(0)
        ],
        [
          true,
          true,
          ethers.utils.parseUnits("50", 18),
          ethers.BigNumber.from(10),
          "https://example2.com",
          ethers.BigNumber.from(0)
        ],
      ]);
    });
  });

  describe("badgeOf", () => {
    beforeEach(async () => {
      const badgeArgs = {
        mintable: true,
        transferable: false,
        amount: ethers.utils.parseUnits("100", 18),
        maxSupply: 10,
        tokenURI: "https://example.com",
        maxMintPerWallet: 0
      };
      await badgeContract.createBadge(badgeArgs);
      await erc20.approve(
        badgeContract.address,
        ethers.utils.parseUnits("10000", 18)
      );
      await badgeContract.mint(1);
    });

    it("returns minted badges", async () => {
      expect(await badgeContract.badgesOf(owner.address)).to.be.eql([
        [
          true,
          false,
          ethers.utils.parseUnits("100", 18),
          ethers.BigNumber.from(10),
          "https://example.com",
          ethers.BigNumber.from(0)
        ],
      ]);
    });

    it("returns empty array without badges", async () => {
      expect(await badgeContract.badgesOf(alice.address)).to.be.eql([]);
    });

    it("returns minted badges with mintByAdmin", async () => {
      await badgeContract.mintByAdmin(1, alice.address);
      expect(await badgeContract.badgesOf(alice.address)).to.be.eql([
        [
          true,
          false,
          ethers.utils.parseUnits("100", 18),
          ethers.BigNumber.from(10),
          "https://example.com",
          ethers.BigNumber.from(0)
        ],
      ]);
    });
  });

  describe("burn", () => {
    beforeEach(async () => {
      const badgeArgs = {
        mintable: true,
        transferable: false,
        amount: ethers.utils.parseUnits("100", 18),
        maxSupply: 10,
        tokenURI: "https://example.com",
        maxMintPerWallet: 0
      };
      await badgeContract.createBadge(badgeArgs);
    });

    it("owner burns own token successfully", async () => {
      await erc20.approve(
        badgeContract.address,
        ethers.utils.parseUnits("10000", 18)
      );
      await badgeContract.mint(1);
      expect(await badgeContract.balanceOf(owner.address, 1)).to.be.eq(1);
      await badgeContract.burn(1, owner.address);
      expect(await badgeContract.balanceOf(owner.address, 1)).to.be.eq(0);
      expect(await badgeContract.totalSupply(1)).to.be.eq(0);
    });

    it("owner burns alice's token successfully", async () => {
      await erc20.transfer(alice.address, ethers.utils.parseUnits("100", 18));
      await erc20
        .connect(alice)
        .approve(badgeContract.address, ethers.utils.parseUnits("10000", 18));
      await badgeContract.connect(alice).mint(1);
      expect(await badgeContract.balanceOf(alice.address, 1)).to.be.eq(1);
      await badgeContract.burn(1, alice.address);
      expect(await badgeContract.balanceOf(alice.address, 1)).to.be.eq(0);
      expect(await badgeContract.totalSupply(1)).to.be.eq(0);
    });

    it("alice burns own token successfully", async () => {
      await erc20.transfer(alice.address, ethers.utils.parseUnits("100", 18));
      await erc20
        .connect(alice)
        .approve(badgeContract.address, ethers.utils.parseUnits("10000", 18));
      await badgeContract.connect(alice).mint(1);
      expect(await badgeContract.balanceOf(alice.address, 1)).to.be.eq(1);
      await badgeContract.connect(alice).burn(1, alice.address);
      expect(await badgeContract.balanceOf(alice.address, 1)).to.be.eq(0);
      expect(await badgeContract.totalSupply(1)).to.be.eq(0);
    });

    it("reverts with Badge Not Exists", async () => {
      await expect(badgeContract.burn(0, owner.address)).to.revertedWith(
        "Badge Not Exists"
      );
      await expect(badgeContract.burn(10, owner.address)).to.revertedWith(
        "Badge Not Exists"
      );
    });

    it("reverts with Invalid: NOT HOLDER", async () => {
      await expect(badgeContract.burn(1, owner.address)).to.revertedWith(
        "Invalid: NOT HOLDER"
      );
    });

    it("reverts with NOT HAVE AUTHORITY", async () => {
      await erc20.approve(
        badgeContract.address,
        ethers.utils.parseUnits("10000", 18)
      );
      await badgeContract.mint(1);
      await expect(
        badgeContract.connect(alice).burn(1, owner.address)
      ).to.revertedWith("NOT HAVE AUTHORITY");
    });
  });
});
