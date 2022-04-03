import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

describe("SHITCOIN", () => {
  let [accountA, accountB, accountC]: SignerWithAddress[] = [];
  let token: Contract;
  const amount = ethers.utils.parseUnits("100", "ether");
  const totalSupply = ethers.utils.parseUnits("1000000", "ether");

  beforeEach(async () => {
    [accountA, accountB, accountC] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("SHITCOIN");
    token = await Token.deploy();
    await token.deployed;
  });
  describe("removeFromBlackList", () => {
    it("should remove a user from the blacklist", async () => {
      await token.addToBlackList(accountB.address);
      await token.removeFromBlackList(accountB.address);
      const isBlackListed = await token.isBlackListed(accountB.address);
      await expect(isBlackListed).to.be.false;
    });
    it("should throw if the user is not blacklisted", async () => {
      await expect(token.removeFromBlackList(accountB.address)).to.be.reverted;
    });
  });
  describe("common", () => {
    it("should total supply return value", async () => {
      expect(await token.totalSupply()).to.equal(totalSupply);
    });
    it("should return account A value", async () => {
      expect(await token.balanceOf(accountA.address)).to.equal(totalSupply);
    });
    it("should return account B value", async () => {
      expect(await token.balanceOf(accountB.address)).to.equal(0);
    });
    it("should allowrance account A to Account B", async () => {
      expect(
        await token.allowance(accountA.address, accountB.address)
      ).to.be.equal(0);
    });
  });
  describe("transfer", () => {
    it("should not transfer when total balaner < amount", async () => {
      await expect(token.transfer(accountB.address, totalSupply.add(1))).to.be
        .reverted;
    });
    it("should transfer", async () => {
      const transferTx = await token.transfer(accountB.address, amount);

      expect(await token.balanceOf(accountA.address)).to.be.equal(
        totalSupply.sub(amount)
      );
      expect(await token.balanceOf(accountB.address)).to.be.equal(amount);

      await expect(transferTx)
        .to.emit(token, "Transfer")
        .withArgs(accountA.address, accountB.address, amount);
    });
  });
  describe("transferFrom", () => {
    it("should revert when amount > balance", async () => {
      await expect(
        token
          .connect(accountB)
          .transferFrom(accountA.address, accountC.address, totalSupply.add(1))
      ).to.be.reverted;
    });
    it("should revert when amount allowance > balance", async () => {
      await expect(
        token
          .connect(accountB)
          .transferFrom(accountA.address, accountC.address, amount)
      ).to.be.reverted;
    });
    it("should transfer from", async () => {
      await token.approve(accountB.address, amount);

      const transfromTx = await token
        .connect(accountB)
        .transferFrom(accountA.address, accountC.address, amount);

      expect(await token.balanceOf(accountA.address)).to.be.equal(
        totalSupply.sub(amount)
      );
      expect(await token.balanceOf(accountC.address)).to.be.equal(amount);

      await expect(transfromTx)
        .to.emit(token, "Transfer")
        .withArgs(accountA.address, accountC.address, amount);
    });
  });
  describe("approve", () => {
    it("should approve", async () => {
      const approveTx = await token.approve(accountB.address, amount);
      expect(
        await token.allowance(accountA.address, accountB.address)
      ).to.be.equal(amount);
      await expect(approveTx)
        .to.emit(token, "Approval")
        .withArgs(accountA.address, accountB.address, amount);
    });
  });
  describe("pause()", () => {
    it("should revert if not pauser role", async () => {
      await expect(token.connect(accountB).pause()).to.be.reverted;
    });
    it("should pause if contract has been paused", async () => {
      const pauseTX = await token.connect(accountA).pause();
      await expect(pauseTX)
        .to.be.emit(token, "Paused")
        .withArgs(accountA.address);
      await expect(token.transfer(accountB.address, amount)).to.be.reverted;
    });
  });
  describe("unpause()", () => {
    it("should revert if not pauser role", async () => {
      await expect(token.connect(accountB).unpause()).to.be.reverted;
    });
    it("should unpause if contract has been paused", async () => {
      await token.connect(accountA).pause();
      const unpauseTX = await token.connect(accountA).unpause();
      await expect(unpauseTX)
        .to.be.emit(token, "Unpaused")
        .withArgs(accountA.address);
      await token.transfer(accountB.address, amount);
    });
  });
});
