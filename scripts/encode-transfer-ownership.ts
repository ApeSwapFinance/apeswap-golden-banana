import { writeJSONToFile } from './helpers/files'
import { Contract } from '@ethersproject/contracts'

// Encode Timelock Transactions
import Ownable from '../build/contracts/Ownable.json'
import Timelock from '../build/contracts/Timelock.json'

// Find timestamp based on a date
// const dateTimestamp = Math.floor(+new Date('March 12, 2021 19:00:00') / 1000)

const getTimestamp = (offsetSeconds = 0): number => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    return currentTimestamp + offsetSeconds;
}

/*
 * TESTNET or MAINNET? 
 */
// TESTNET
// const TREASURY_ADDRESS = '0x9a5cd78A7fC8C8A88C77c036b904B777CB50A2BF'; // Testnet dummy treasury
// const NEW_OWNER = '0xE375D169F8f7bC18a544a6e5e546e63AD7511581'; // TESTNET Address
// const TIMELOCK_ADDRESS = '0xa350f1e2e7ca4d1f5032a8c73f8543db031a6d51'; // Testnet Timelock
// const DEFAULT_OFFSET = 60 * 1;

// MAINNET 
const TREASURY_ADDRESS = '0xec4b9d1fd8A3534E31fcE1636c7479BcD29213aE';
const NEW_OWNER = '0x211cBF06441BeB429677a011eAd947Eb6716054E'; // Secure Timelock [BSC]
const TIMELOCK_ADDRESS = '0x2F07969090a2E9247C761747EA2358E5bB033460';
const DEFAULT_OFFSET = 3600 * 6.5;


const treasuryContract = new Contract(TREASURY_ADDRESS, Ownable.abi);
const timelockContract = new Contract(TIMELOCK_ADDRESS, Timelock.abi);

const encode = async () => {
    const ETA = getTimestamp(DEFAULT_OFFSET);
    const method = 'transferOwnership'
    const newOwner = NEW_OWNER;
    const transferOwnershipEncode = await treasuryContract.populateTransaction[method](newOwner);

        /**
         * Encode child tx
         */
        // queueTransaction(address target, uint value, string memory signature, bytes memory data, uint eta)
        const timelockQueueEncoded = await timelockContract.populateTransaction
            .queueTransaction(
                TREASURY_ADDRESS,
                0,
                '',
                transferOwnershipEncode.data,
                ETA
            )

        // executeTransaction(address target, uint value, string memory signature, bytes memory data, uint eta) public payable returns (bytes memory)
        const timelockExecuteEncoded = await timelockContract.populateTransaction
            .executeTransaction(
                TREASURY_ADDRESS,
                0,
                '',
                transferOwnershipEncode.data,
                ETA
            )

        // cancelTransaction(address target, uint value, string memory signature, bytes memory data, uint eta)
        const timelockCancelEncoded = await timelockContract.populateTransaction
            .cancelTransaction(
                TREASURY_ADDRESS,
                0,
                '',
                transferOwnershipEncode.data,
                ETA
            )

        const output = {
            'ETA-Timestamp': ETA,
            'Date': new Date(ETA * 1000),
            queueTx: "",
            executeTx: "",
            cancelTx: "",
            method,
            newOwner,
            transferOwnershipEncode,
            timelockQueueEncoded,
            timelockExecuteEncoded,
            timelockCancelEncoded
        }

    console.dir(output);
    await writeJSONToFile('./scripts/encode-output.json', output);
}

encode().then(() => {
    console.log('Done encoding!');
})
