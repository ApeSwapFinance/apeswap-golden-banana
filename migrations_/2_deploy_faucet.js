const GoldenBananaMock = artifacts.require("GoldenBananaMock");
const Faucet = artifacts.require("Faucet");
const { getNetworkConfig } = require('../deploy.config')

module.exports = async function(deployer,  network, accounts) {
    console.log(network)
    let { admin } = getNetworkConfig(network, accounts);
    const initialSupply = '3000000000000000000000000000'


    await deployer.deploy(GoldenBananaMock, initialSupply);
    const gnana = await GoldenBananaMock.at(GoldenBananaMock.address);
    const faucet = await deployer.deploy(Faucet, GoldenBananaMock.address);
    await gnana.transfer(faucet.address, initialSupply);
    await gnana.excludeAccount(faucet.address);
    await faucet.transferOwnership(admin);
};