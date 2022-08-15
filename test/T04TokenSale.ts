import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Tarefa 04 - Venda de Token", function () {
  async function deploySale() {
    const [owner, anotherAccount] = await ethers.getSigners();
    const LiftToken = await ethers.getContractFactory("T01Token");
    const token = await LiftToken.deploy();
    const LiftSale = await ethers.getContractFactory("T04TokenSale");
    const sale = await LiftSale.deploy(token.address);

    await token.approve(sale.address, ethers.constants.MaxUint256)

    return { token, sale, owner, anotherAccount };
  }

  describe("Functions", function () {
    it("Should fail to buy tokens, amount too high", async function () {
      const { sale, owner, anotherAccount, token } = await loadFixture(deploySale);
      const balanceOfOwner = await token.balanceOf(owner.address)
      console.log("Before: ", balanceOfOwner.toString().padStart(18));
      await expect(sale.connect(anotherAccount).buy1pra1({ value: BigInt((10 ** 18) + 10 ** 9) })).to.be.revertedWith("Por favor, tenha pena do seu rico dinheirinho...");
      console.log("After : ", balanceOfOwner.toString().padStart(18));
    });
    it("Should buy max tokens", async function () {
      const { sale, owner, anotherAccount, token } = await loadFixture(deploySale);
      let balanceETHOwner = await ethers.provider.getBalance(owner.address)
      console.log("BeforeETH: ", balanceETHOwner.toString().padStart(18));
      await expect(sale.connect(anotherAccount).buy1pra1({ value: BigInt(10 ** 18) })).not.to.be.reverted;
      const balanceOfOwner = await token.balanceOf(owner.address)
      balanceETHOwner = await ethers.provider.getBalance(owner.address)
      const balanceOfBuyer = await token.balanceOf(anotherAccount.address)
      console.log("After : ", balanceOfOwner.toString().padStart(18));
      console.log("After : ", balanceOfBuyer.toString().padStart(18));
      console.log("AfterETH : ", balanceETHOwner.toString().padStart(18));
    });
    it("Should fail to buy tokens, amount too low", async function () {
      const { sale, owner, anotherAccount, token } = await loadFixture(deploySale);
      const balanceOfOwner = await token.balanceOf(owner.address)
      console.log("Before: ", balanceOfOwner.toString().padStart(18));
      await expect(sale.connect(anotherAccount).buy1pra1({ value: BigInt((10 ** 9) - 10 ** 9) })).to.be.revertedWith("Por favor, não seja tão mão de vaca, pelo menos 1 gwei...");
      console.log("After : ", balanceOfOwner.toString().padStart(18));
    });
    it("Should buy min tokens", async function () {
      const { sale, owner, anotherAccount, token } = await loadFixture(deploySale);
      await expect(sale.connect(anotherAccount).buy1pra1({ value: BigInt(10 ** 9) })).not.to.be.reverted;
      const balanceOfOwner = await token.balanceOf(owner.address)
      const balanceOfBuyer = await token.balanceOf(anotherAccount.address)
      console.log("After : ", balanceOfOwner.toString().padStart(18));
      console.log("After : ", balanceOfBuyer.toString().padStart(18));
    });
    it("Should get event \"Sold\"", async function () {
      const { sale, owner, anotherAccount, token } = await loadFixture(deploySale);
      await expect(sale.connect(anotherAccount)
        .buy1pra1({ value: BigInt(10 ** 9) }))
        .to.emit(sale, "Sold").withArgs(anotherAccount.address, BigInt(10 ** (9 - 9)))
    });
  });
});
