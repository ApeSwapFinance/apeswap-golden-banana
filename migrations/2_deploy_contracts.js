const GoldenBanana = artifacts.require("GoldenBanana");
const Treasury = artifacts.require("Treasury");
const MockBEP20 = artifacts.require("MockBEP20");
const { getNetworkConfig } = require('../deploy.config')

module.exports = async function(deployer,  network, accounts) {
    console.log(network)
    let { bananaAddress, gnanaAddress } = getNetworkConfig(network, accounts);
    const initialSupply = '3000000000000000000000000000'

    if (!bananaAddress) {
        await deployer.deploy(MockBEP20, 'BANANA-Develop', 'BANANA', '1000000000000000000000000');
        bananaAddress = MockBEP20.address
    }

    if (!gnanaAddress) {
        await deployer.deploy(GoldenBanana, initialSupply);
        gnanaAddress = GoldenBanana.address;
    }

    await deployer.deploy(Treasury, bananaAddress, gnanaAddress);

    const goldenBanana = await GoldenBanana.deployed();
    await goldenBanana.excludeAccount(Treasury.address);
};