const RBanana = artifacts.require("RBanana");

module.exports = async function(deployer) {
    await deployer.deploy(RBanana, '100');
};



