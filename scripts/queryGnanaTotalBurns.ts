import { EtherscanService, getConfig } from '@defifofum/etherscan-sdk';
import { writeJSONToFile } from './helpers/files';
import { ether } from './helpers/bnHelper';
const { BN } = require('@openzeppelin/test-helpers');

const { baseUrl: BASE_URL, apiKey: API_KEY } = getConfig('bsc');
const etherscanService = new EtherscanService(BASE_URL, API_KEY);
// BSC API is 5 requests per second on the free plan. 
const REQUEST_LIMIT_DELAY = 500;
// 1 Block before deployment block.
const GNANA_START_BLOCK = 6746485;
// BSCScan will only return the first 10,000 transfers. 
// This settings aims to ensure that no transfers are missed
const BLOCK_DIFF = 100000;
// TODO: CAP to set the final call to 'latest'
const MAX_BLOCK = 23546350;

// NOTE: Check config settings
const filterConfig = {
    contractAddress: '0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95', // BANANA
    from: '0xec4b9d1fd8a3534e31fce1636c7479bcd29213ae',
    to: '0x000000000000000000000000000000000000dead',
};

async function wait(timeMs: number) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(undefined);
        }, timeMs);
    });
}


async function getTransfersAndFilter(startBlock?: number, endBlock?: number | string) {
    const transfers = await etherscanService.getAccountTokenTransfers(filterConfig.from, {
        startBlock,
        endBlock,
    });

    try {
        // Returned are all transfers from the `from` address. 
        const filteredTransfers = transfers.filter((transfer) => {
            if (transfer.contractAddress != filterConfig.contractAddress) return false;
            if (transfer.to != filterConfig.to) return false;
            if (transfer.from != filterConfig.from) return false;
            return true;
        });

        return filteredTransfers;
    } catch {
        // Probably rate limit
        console.dir({ error: transfers, startBlock, endBlock })
        return [];
    }
}

async function script() {
    const transferPromises = [];

    for (let startBlock = GNANA_START_BLOCK; startBlock <= MAX_BLOCK; startBlock += BLOCK_DIFF) {
        // Subtracting 1 to not overlap with next iteration (assuming start/end are both inclusive)
        let endBlock: string | number = startBlock + BLOCK_DIFF - 1;
        // if(endBlock >= MAX_BLOCK) endBlock = 'latest';
        transferPromises.push(getTransfersAndFilter(startBlock, endBlock));
        await wait(REQUEST_LIMIT_DELAY);
    }

    const transferArray = await Promise.all(transferPromises);
    const transfers = transferArray.reduce((accumulator, currentValue) => [...accumulator, ...currentValue]);
    console.dir({ numTransfers: transfers.length });
    await writeJSONToFile('./scripts/gnana-burn-output.json', transfers);

    let totalBurn = new BN('0');
    for await (const gnanaBurn of transfers) {
        totalBurn = totalBurn.add(new BN((gnanaBurn as unknown as { value: string }).value))
    }
    totalBurn = totalBurn.toString();

    console.log(`Total Burn Wei: ${totalBurn}.`);
    console.log(`Total Burn: ${ether(totalBurn)}.`);
};

(async function () {
    try {
        await script();
        console.log('🎉')
        process.exit(0);
    } catch (e) {
        console.dir(e);
        process.exit(1);
    }
})();
