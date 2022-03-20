import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

describe("CUG", () => {
  let [accountA, accountB, accountC]: SignerWithAddress[] = [];
  let token: Contract;
  const amount = 100;
  const totalSupply = 1000000;

  beforeEach(async () => {
    [accountA, accountB, accountC] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("CUG");
    token = await Token.deploy();
    await token.deployed;
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
      await expect(token.transfer(accountB.address, totalSupply + 1)).to.be
        .reverted;
    });
    it("should transfer", async () => {
      const transferTx = await token.transfer(accountB.address, amount);

      expect(await token.balanceOf(accountA.address)).to.be.equal(
        totalSupply - amount
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
          .transferFrom(accountA.address, accountC.address, totalSupply + 1)
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
        totalSupply - amount
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
});
