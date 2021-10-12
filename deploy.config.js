
function getNetworkConfig(network, accounts) {
    if(["bsc", "bsc-fork"].includes(network)) {
        console.log(`Deploying with BSC MAINNET config.`)
        return {
            bananaAddress: '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95',
            admin: '0xCaE366497aC10De7f1faeBBf496E7dBD7764C6b3'
        }
    } else if (['bsc-testnet', 'bsc-testnet-fork'].includes(network)) {
        console.log(`Deploying with BSC testnet config.`)
        return {
            bananaAddress: '0x4Fb99590cA95fc3255D9fA66a1cA46c43C34b09a',
            gnanaAddress: '0x9407026d236DEAE22CC1F3c419A9e47CBfCFE9E5',
            // admin: '0xb5e1Ec9861D7c1C99cB3d79dd602cC6122F0d7dc'  // Apeguru
            admin: '0xE375D169F8f7bC18a544a6e5e546e63AD7511581',  // Tastic
        }
    } else if (['development'].includes(network)) {
        console.log(`Deploying with development config.`)
        return {
            bananaAddress: undefined,
            admin: '0xb5e1Ec9861D7c1C99cB3d79dd602cC6122F0d7dc'
        }
    } else {
        throw new Error(`No config found for network ${network}.`)
    }
}

module.exports = { getNetworkConfig };
