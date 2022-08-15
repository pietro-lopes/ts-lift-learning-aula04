import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Tarefa 03 - Transferência com limitações", function () {
  async function deployToken() {
    const [owner, anotherAccount] = await ethers.getSigners();
    const transferAmount = BigInt(1_000_000)
    const unlockTime = 1672542000 // Sun Jan 01 2023 00:00:00 GMT-0300 (Brasilia Standard Time)
    const LiftTokenOwner = await ethers.getContractFactory("T03TokenOwner");
    const token = await LiftTokenOwner.deploy();

    return { token, owner, anotherAccount, transferAmount, unlockTime };
  }

  describe("Funções", function () {
    describe("transfer", function () {
      it("Dono deve transferir para anotherAccount", async function () {
        const { token, anotherAccount, transferAmount } = await loadFixture(deployToken);
        // A conta owner é sempre conectada por padrão, não há necessidade
        // de dar .connect(owner) igual no próximo teste
        await expect(token.transfer(anotherAccount.address, transferAmount)).not.to.be.reverted
      });
      it("anotherAccount deve falhar em transferir para owner antes do prazo", async function () {
        const { token, owner, anotherAccount, transferAmount } = await loadFixture(deployToken);
        // Transferindo do owner pro anotherAccount
        await token.transfer(anotherAccount.address, transferAmount)
        // Tentando transferir de volta pro owner
        await expect(token.connect(anotherAccount).transfer(owner.address, transferAmount)).to.be.revertedWith("Failed to transfer... Please wait until 2023!")
      });
      it("anotherAccount deve transferir com sucesso após 2023", async function () {
        const { token, owner, anotherAccount, transferAmount, unlockTime } = await loadFixture(deployToken);

        await token.transfer(anotherAccount.address, transferAmount)
        // Aumentando a data do bloco para unlockTime
        await time.increaseTo(unlockTime);
        // Tentando transferir de volta pro owner
        await expect(token.connect(anotherAccount).transfer(owner.address, transferAmount)).not.to.be.reverted
      });
    })
    describe("transferFrom", function () {
      it("Dono deve transferir para anotherAccount", async function () {
        const { token, anotherAccount, transferAmount, owner } = await loadFixture(deployToken);
        // TransferFrom requer aprovação
        await token.approve(owner.address, ethers.constants.MaxUint256)

        await expect(token.transferFrom(owner.address, anotherAccount.address, transferAmount)).not.to.be.reverted
      });
      it("anotherAccount deve falhar em transferir para owner antes do prazo", async function () {
        const { token, owner, anotherAccount, transferAmount } = await loadFixture(deployToken);

        await token.approve(owner.address, ethers.constants.MaxUint256)
        await token.transferFrom(owner.address, anotherAccount.address, transferAmount)
        await token.connect(anotherAccount).approve(anotherAccount.address, ethers.constants.MaxUint256)

        await expect(token.connect(anotherAccount).transferFrom(anotherAccount.address, owner.address, transferAmount)).to.be.revertedWith("Failed to spend tokens... Please wait until 2023!")
      });
      it("anotherAccount deve transferir com sucesso após 2023", async function () {
        const { token, owner, anotherAccount, transferAmount, unlockTime } = await loadFixture(deployToken);

        await token.approve(owner.address, ethers.constants.MaxUint256)
        await token.transferFrom(owner.address, anotherAccount.address, transferAmount)
        await token.connect(anotherAccount).approve(anotherAccount.address, ethers.constants.MaxUint256)
        await time.increaseTo(unlockTime);

        await expect(token.connect(anotherAccount).transferFrom(anotherAccount.address, owner.address, transferAmount)).not.to.be.reverted
      });
    })
  });
});
