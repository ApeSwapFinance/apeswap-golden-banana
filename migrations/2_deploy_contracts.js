const RBanana = artifacts.require("RBanana");
const Treasury = artifacts.require("Treasury");
const MockBEP20 = artifacts.require("MockBEP20");
const { getNetworkConfig } = require('../deploy.config')

module.exports = async function(deployer,  network, accounts) {
    console.log(network)
    let { bananaAddress } = getNetworkConfig(network, accounts);
    const initialSupply = '3000000000000000000000000000'

    if (!bananaAddress) {
        await deployer.deploy(MockBEP20, 'BANANA-Develop', 'BANANA', '1000000000000000000000000');
        bananaAddress = MockBEP20.address
    }

    await deployer.deploy(RBanana, initialSupply);
    await deployer.deploy(Treasury, bananaAddress, RBanana.address);
};