const GoldenBanana = artifacts.require("GoldenBanana");
const Treasury = artifacts.require("Treasury");
const Timelock = artifacts.require("Timelock");
const MockBEP20 = artifacts.require("MockBEP20");
const { getNetworkConfig } = require('../deploy.config')

module.exports = async function(deployer,  network, accounts) {
    console.log(network)
    let { bananaAddress, admin } = getNetworkConfig(network, accounts);
    const initialSupply = '3000000000000000000000000000'

    if (!bananaAddress) {
        await deployer.deploy(MockBEP20, 'BANANA-Develop', 'BANANA', '1000000000000000000000000');
        bananaAddress = MockBEP20.address
    }

    await deployer.deploy(Timelock, admin, 43000); // 12 hours (6 hour minimum)
    await deployer.deploy(GoldenBanana, initialSupply);
    await deployer.deploy(Treasury, bananaAddress, GoldenBanana.address);

    const goldenBanana = await GoldenBanana.deployed();
    await goldenBanana.excludeAccount(Treasury.address);
};