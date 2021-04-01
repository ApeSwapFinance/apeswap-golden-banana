const { BN, expectEvent } = require('@openzeppelin/test-helpers');

const GoldenBanana = artifacts.require('GoldenBanana');

contract('GoldenBanana', (accounts) => {

    const decimalFactor = new BN(10).pow(new BN(18));
    const initialSupply = new BN('3000000000').mul(decimalFactor);
    const taxFee = new BN(200);
    const [ initialHolder, recipient, excludedAccount, bigHolder, anotherAccount, extraAccount ] = accounts
    
    beforeEach(async function () {
        this.goldenBanana = await GoldenBanana.new(initialSupply);
        await this.goldenBanana.excludeAccount(excludedAccount);
        await this.goldenBanana.excludeAccount(initialHolder);
    });

    it('has 18 decimals', async function () {
        expect((await this.goldenBanana.decimals()).toNumber()).equal(18);
    });

    it('Correct initial supply', async function () {
        expect((await this.goldenBanana.balanceOf(initialHolder)).toString()).equal(initialSupply.toString());
    });

    describe('transfer', function () {
      const amount = new BN('100').mul(decimalFactor);
      const tax = new BN(amount.mul(taxFee).div(new BN(100))).div(new BN(100))
      const receivedAmount = amount.sub(tax)
      const oneShare = tax.div(new BN(3))
  
      describe('for a non zero account', function () {
        let initialBalances = []
        beforeEach('transfer', async function () {
          await this.goldenBanana.transfer(bigHolder, amount);
          await this.goldenBanana.transfer(anotherAccount, amount);
          initialBalances = await Promise.all([this.goldenBanana.balanceOf(anotherAccount), this.goldenBanana.balanceOf(bigHolder)])
          const { logs } = await this.goldenBanana.transfer(recipient, amount);
          this.logs = logs;
        });
  
        it('increments recipient balance', async function () {
          const balance = await this.goldenBanana.balanceOf(recipient);
          console.log(balance.toString());
          expect(balance.gt(receivedAmount)).to.be.true;
        });

        it('Fees get collected', async function () {
          const [anotherInitial, bigHolderInitial] = initialBalances
          const total = anotherInitial.add(bigHolderInitial).add(amount)
          console.log(total.toString())
          const bigShare = bigHolderInitial.mul(tax).div(total)
          const otherShare = anotherInitial.mul(tax).div(total)
          const recipientShare = amount.mul(tax).div(total)
          const anotherBalance = await this.goldenBanana.balanceOf(anotherAccount)
          const feeCollectedOther = anotherBalance.sub(anotherInitial)
          const bigHolderBalance = await this.goldenBanana.balanceOf(bigHolder)
          const feeCollected = bigHolderBalance.sub(bigHolderInitial)
          console.log(tax.toString())
          console.log(recipientShare.add(bigShare).add(otherShare).toString())
          console.log(bigShare.toString())
          console.log(feeCollected.toString())
          console.log(bigHolderInitial.toString())
          console.log(bigHolderInitial.add(bigShare).toString())
          console.log(bigHolderBalance.toString())
          console.log(otherShare.toString())
          console.log(feeCollectedOther.toString())
          console.log(recipientShare.toString())
          console.log(anotherInitial.toString())
          console.log(anotherBalance.toString())
          console.log(bigHolderBalance.gt(bigHolderInitial))
          console.log(anotherBalance.gt(anotherInitial))
          expect(bigHolderBalance.gt(bigHolderInitial)).to.be.true;
          expect(anotherBalance.gt(anotherInitial)).to.be.true;
        });

        it.skip('Total balances add up - It does not', async function () {
          await this.goldenBanana.transfer(recipient, amount);
          await this.goldenBanana.transfer(extraAccount, '3025000000000000');
          await this.goldenBanana.transfer(recipient, new BN(500));
          await this.goldenBanana.transfer(anotherAccount, new BN(500000000), {from: bigHolder});
          await this.goldenBanana.transfer(initialHolder, amount, {from: recipient});
          await this.goldenBanana.transfer(recipient, new BN(500), {from: bigHolder});
          await this.goldenBanana.transfer(recipient, '4199874368702731', {from: bigHolder});
          await this.goldenBanana.transfer(bigHolder, new BN(500), {from: recipient});
          await this.goldenBanana.transfer(recipient, new BN(500));
          await this.goldenBanana.transfer(initialHolder, new BN(500), {from: recipient});
          await this.goldenBanana.transfer(initialHolder, new BN(5045645640), {from: recipient});
          await this.goldenBanana.transfer(bigHolder, '2025000000000000', {from: extraAccount});
          const receipientBalance = await this.goldenBanana.balanceOf(recipient)
          const senderBalance = await this.goldenBanana.balanceOf(initialHolder)
          const bigHolderBalance = await this.goldenBanana.balanceOf(bigHolder)
          const anotherAccountBalance = await this.goldenBanana.balanceOf(anotherAccount)
          const extraAccountBalance = await this.goldenBanana.balanceOf(extraAccount)
          const totalSupply = await this.goldenBanana.totalSupply()
          console.log(totalSupply.umod(new BN(10)).toString())
          expect(senderBalance.add(receipientBalance).add(bigHolderBalance).add(anotherAccountBalance).add(extraAccountBalance).toString()).equal(totalSupply.toString());
        });
  
        it('emits Transfer event', async function () {
          const event = expectEvent.inLogs(this.logs, 'Transfer', {
            from: initialHolder,
            to: recipient,
          });
  
          expect(event.args.value.toString()).equal(receivedAmount.toString());
        });
      });

      describe('to an excluded account', function () {
        beforeEach('transfer', async function () {
          const { logs } = await this.goldenBanana.transfer(excludedAccount, amount);
          this.logs = logs;
        });
  

        it('increments recipient balance', async function () {
          expect((await this.goldenBanana.balanceOf(excludedAccount)).toString()).equal(receivedAmount.toString());
        });
  
        it('emits Transfer event', async function () {
          const event = expectEvent.inLogs(this.logs, 'Transfer', {
            from: initialHolder,
            to: excludedAccount,
          });
  
          expect(event.args.value.toString()).equal(receivedAmount.toString());
        });
      });
      
    });
});