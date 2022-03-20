import { expect } from "chai";
import { ethers } from "hardhat";

describe("HelloWorld", function () {
  it("should return new msg when updated", async function () {
    const HelloWorld = await ethers.getContractFactory("HelloWorld");
    const helloWorld = await HelloWorld.deploy("Hello, world!");
    await helloWorld.deployed();

    expect(await helloWorld.get()).to.equal("Hello, world!");

    const setHelloWorldTx = await helloWorld.set("Hola, mundo!");

    // wait until the transaction is mined
    await setHelloWorldTx.wait();

    expect(await helloWorld.get()).to.equal("Hola, mundo!");
  });
});
