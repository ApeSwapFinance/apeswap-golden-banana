const Faucet = artifacts.require("Faucet");
const { ether } = require('@openzeppelin/test-helpers');
const { getNetworkConfig } = require('../deploy.config')

module.exports = async function(deployer,  network, accounts) {
    console.log(network)
    let { admin } = getNetworkConfig(network, accounts);

    const erc20TokenAddress = '0x4Fb99590cA95fc3255D9fA66a1cA46c43C34b09a'

    await deployer.deploy(Faucet, erc20TokenAddress);
    const faucet = await Faucet.at(Faucet.address);
    await faucet.adjustTransferAmount(ether('1000'));
    await faucet.transferOwnership(admin);
};