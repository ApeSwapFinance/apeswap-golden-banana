import { writeJSONToFile } from './helpers/files';
const { BN } = require('@openzeppelin/test-helpers');

import { AccountTokenTransfer } from '@defifofum/etherscan-sdk';
import GnanaBurnOutputRaw from './221201-gnana-burn-output.json'
import { ether } from './helpers/bnHelper';
const GnanaBurnOutput = GnanaBurnOutputRaw as AccountTokenTransfer[];

const DATE_STRING = "2022-11-25";
const START_UNIX_TIMESTAMP = new Date(DATE_STRING) as unknown as number / 1000;

function sortTransfersByTimestamp(transfers: AccountTokenTransfer[]) {
    return transfers.sort((a,b) => Number(a.timeStamp) - Number(b.timeStamp));
}

async function script() {
    const gnanaBurnOutput = sortTransfersByTimestamp(GnanaBurnOutput);
    const transferLength = gnanaBurnOutput.length;

    let totalBurn = new BN('0');
    // NOTE: Reverse for loop
    for (let index = transferLength - 1; index > 0; index--) {
        const burnTokenTransfer = gnanaBurnOutput[index];
        if(Number(burnTokenTransfer.timeStamp) < START_UNIX_TIMESTAMP) {
            console.log(`Hit the starting date of: ${DATE_STRING} at timestamp: ${START_UNIX_TIMESTAMP}`)
            break;
        }
        totalBurn = totalBurn.add(new BN(burnTokenTransfer.value));
    }

    console.log(`Total Burn Wei: ${totalBurn}.`);
    console.log(`Total Burn: ${ether(totalBurn)}.`);
}

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
