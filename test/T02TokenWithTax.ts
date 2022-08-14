import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Tarefa 02 - Token com taxa de queima", function () {
  async function deployToken() {
    // Definindo dono e outra conta para teste
    const [owner, anotherAccount] = await ethers.getSigners();
    // Definindo contrato e dando deploy
    const LiftToken = await ethers.getContractFactory("T02TokenWithTax");
    const token = await LiftToken.deploy();
    // Valores a serem testados a serem testados
    const transferAmount = BigInt(1_000_000)
    // return nos valores para que os testes recebam através do loadFixture
    return { token, owner, anotherAccount, transferAmount };
  }

  describe("Funções", function () {
    // transfer recebe os parametros: "to" e "amount"
    // quem chama a função transfer TEM QUE estar em posse dos tokens
    describe("transfer", function () {
      it("Deve transferir para anotherAccount", async function () {
        const { token, owner, anotherAccount, transferAmount } = await loadFixture(deployToken);
        // Espera não reverter a transação
        await expect(token.transfer(anotherAccount.address, transferAmount)).not.to.be.reverted
      });
      it("Deve pegar os eventos de transferência", async function () {
        const { token, owner, anotherAccount, transferAmount } = await loadFixture(deployToken);
        // Pega o valor da taxa no contrato
        const TAX = await token.TAX()
        // Faz a transferência, lê os eventos e compara com os parâmetros iniciais
        await expect(token.transfer(anotherAccount.address, transferAmount))
          .to.emit(token, "Transfer")
          .withArgs(owner.address, anotherAccount.address, transferAmount - TAX.mul(transferAmount).div(100).toBigInt())
      });
      it("Deve pegar os eventos de queima", async function () {
        const { token, owner, anotherAccount, transferAmount } = await loadFixture(deployToken);

        const TAX = await token.TAX()
        await expect(token.transfer(anotherAccount.address, transferAmount))
          .to.emit(token, "Transfer")
          .withArgs(owner.address, ethers.constants.AddressZero, TAX.mul(transferAmount).div(100))
      });
    });
    // transferFrom recebe os parametros: "from", "to" e "amount"
    // Não é necessário estar em posse dos tokens, porém precisa de aprovação
    // do "from"
    describe("transferFrom", function () {
      it("Deve transferir para anotherAccount", async function () {
        const { token, owner, anotherAccount, transferAmount } = await loadFixture(deployToken);
        // transferFrom requer que seja aprovado quem irá gastar os tokens
        await expect(token.approve(owner.address, ethers.constants.MaxUint256)).not.to.be.reverted
        // Espera não reverter a transação
        await expect(token.transferFrom(owner.address, anotherAccount.address, transferAmount)).not.to.be.reverted
      });
      it("Deve pegar os eventos de transferência", async function () {
        const { token, owner, anotherAccount, transferAmount } = await loadFixture(deployToken);

        await expect(token.approve(owner.address, ethers.constants.MaxUint256)).not.to.be.reverted

        const TAX = await token.TAX()
        await expect(token.transferFrom(owner.address, anotherAccount.address, transferAmount))
          .to.emit(token, "Transfer")
          .withArgs(owner.address, anotherAccount.address, transferAmount - TAX.mul(transferAmount).div(100).toBigInt())
      });
      it("Deve pegar os eventos de queima", async function () {
        const { token, owner, anotherAccount, transferAmount } = await loadFixture(deployToken);

        await expect(token.approve(owner.address, ethers.constants.MaxUint256)).not.to.be.reverted

        const TAX = await token.TAX()
        await expect(token.transferFrom(owner.address, anotherAccount.address, transferAmount))
          .to.emit(token, "Transfer")
          .withArgs(owner.address, ethers.constants.AddressZero, TAX.mul(transferAmount).div(100).toBigInt())
      });
    });
  });
});
