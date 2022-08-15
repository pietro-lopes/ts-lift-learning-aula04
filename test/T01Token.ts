import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Tarefa 01 - Criar token", function () {
  async function deployToken() {
    // Definindo dono e outra conta para teste
    const [owner, anotherAccount] = await ethers.getSigners();
    // Definindo contrato e dando deploy
    const LiftToken = await ethers.getContractFactory("T01Token");
    const token = await LiftToken.deploy();
    // Valores a serem testados a serem testados
    const decimals = 9
    const totalSupply = BigInt(1e6 * 10 ** decimals)
    const transferAmount = BigInt(1_000_000)
    // return nos valores para que os testes recebam através do loadFixture
    return { token, owner, totalSupply, decimals, anotherAccount, transferAmount };
  }

  describe("Funções", function () {
    // Teste para pegar o totalSupply correto
    it("Deve pegar totalSupply", async function () {
      // Carregando variáveis
      const { token, totalSupply } = await loadFixture(deployToken);
      // Comparando o totalSupply do token com o carregado no loadFixture
      expect(await token.totalSupply()).to.equal(totalSupply);
    });
    // Teste para pegar os decimais correto
    it("Deve pegar os decimals", async function () {
      const { token, decimals } = await loadFixture(deployToken);

      expect(await token.decimals()).to.equal(decimals);
    });
    // Teste para pegar os eventos de aprovação emitido pelo token
    it("Deve pegar os eventos de aprovação", async function () {
      const { token, owner } = await loadFixture(deployToken);
      // Aprovando token com o máximo de allowance (0xFFFFFFF....)
      await expect(token.approve(owner.address, ethers.constants.MaxUint256))
        .to.emit(token, "Approval")
        .withArgs(owner.address, owner.address, ethers.constants.MaxUint256)
    });
    // Teste para pegar os eventos de transferência
    it("Deve pegar os eventos de transferência", async function () {
      const { token, owner, transferAmount, anotherAccount } = await loadFixture(deployToken);
      // Transferindo transferAmount para anotherAccount
      await expect(token.transfer(anotherAccount.address, transferAmount))
        .to.emit(token, "Transfer")
        .withArgs(owner.address, anotherAccount.address, transferAmount);
    });
  });
});
