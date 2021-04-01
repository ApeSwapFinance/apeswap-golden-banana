const { BN } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const BURN_ADDRESS = '0x000000000000000000000000000000000000dEaD'
const GoldenBanana = artifacts.require("GoldenBanana");
const Treasury = artifacts.require("Treasury");
const MockBEP20 = artifacts.require("MockBEP20");

contract('GoldenBanana', (accounts) => {

    const decimalFactor = new BN(10).pow(new BN(18));
    const initialSupply = new BN('3000000000').mul(decimalFactor);
    const taxFee = new BN(200);
    const burnFee = new BN(2857);
    const [ initialHolder, seller, buyer] = accounts
    
    beforeEach(async function () {
        this.goldenBanana = await GoldenBanana.new(initialSupply);
        this.banana =  await MockBEP20.new('BANANA-Develop', 'BANANA', initialSupply);

        this.treasury = await Treasury.new(this.banana.address, this.goldenBanana.address);
        await this.goldenBanana.excludeAccount(this.treasury.address);
        await this.goldenBanana.transfer(this.treasury.address, initialSupply.div(new BN(2)));

        await this.banana.transfer(buyer, new BN('100').mul(decimalFactor));
        await this.goldenBanana.transfer(seller, new BN('100').mul(decimalFactor));
    });

    describe('buy', function () {
      const amount = new BN('5').mul(decimalFactor);
      const tax = new BN(amount.mul(taxFee).div(new BN(100))).div(new BN(100))
      const burn = new BN(amount.mul(burnFee).div(new BN(100))).div(new BN(100))
      const receivedAmount = amount.sub(tax).sub(burn)

      describe('for a non zero account', function () {
        beforeEach('transfer', async function () {
          await this.banana.approve(this.treasury.address, initialSupply, { from: buyer });
          const { logs } = await this.treasury.buy(amount, { from: buyer });
          this.logs = logs;
        });
  
        it('increments recipient balance and triggers burn', async function () {
          const balance = await this.goldenBanana.balanceOf(buyer);
          const burned = await this.banana.balanceOf(BURN_ADDRESS);
          expect(burned.eq(burn)).to.be.true;
          expect(balance.gte(receivedAmount)).to.be.true;
        });
      });

    });

    describe('sell', function () {
      const amount = new BN('5').mul(decimalFactor);
      const tax = new BN(amount.mul(taxFee).div(new BN(100))).div(new BN(100))
      const receivedAmount = amount.sub(tax)

      describe('for a non zero account', function () {
        let initialBalance;
        beforeEach('transfer', async function () {
          
          initialBalance = await this.goldenBanana.balanceOf(seller);
          // BUY to have money at fund
          await this.banana.approve(this.treasury.address, initialSupply, { from: buyer });
          await this.treasury.buy(amount.mul(new BN(2)), { from: buyer });

          // SELL
          await this.goldenBanana.approve(this.treasury.address, initialSupply, { from: seller });
          const { logs } = await this.treasury.sell(amount, { from: seller });
          this.logs = logs;
        });
  
        it('increments sells the megabanana for banana', async function () {
          const balance = await this.goldenBanana.balanceOf(seller);
          const bananaBalance = await this.banana.balanceOf(seller);
          // TODO validate initial balance vs balance
          console.log(initialBalance.toString());
          console.log(balance.toString());
          expect(bananaBalance.eq(receivedAmount)).to.be.true;
        });
      });

    });
});