const GoldenBananaMock = artifacts.require("GoldenBananaMock");
const { getNetworkConfig } = require('../deploy.config')

module.exports = async function(deployer,  network, accounts) {
    console.log(network)
    let { admin } = getNetworkConfig(network, accounts);
    const initialSupply = '3000000000000000000000000000'

    await deployer.deploy(GoldenBananaMock, initialSupply);
    const gnana = await GoldenBananaMock.at(GoldenBananaMock.address);
    await gnana.excludeAccount(gnana.address);
    await gnana.transfer(GoldenBananaMock.address, initialSupply);
    await gnana.transferOwnership(admin);
};