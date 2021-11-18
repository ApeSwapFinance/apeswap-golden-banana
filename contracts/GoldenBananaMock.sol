// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

/*
 * ApeSwapFinance
 * App:             https://apeswap.finance
 * Medium:          https://ape-swap.medium.com/
 * Twitter:         https://twitter.com/ape_swap
 * Telegram:        https://t.me/ape_swap
 * Announcements:   https://t.me/ape_swap_news
 * GitHub:          https://github.com/ApeSwapFinance
 */

import "./RBEP20.sol";

contract GoldenBananaMock is RBEP20 {
    constructor (uint256 initialSupply) public RBEP20(initialSupply, "Golden Banana Mock", "GNANA MOCK", 18, 200) {}

    function mint() external {
        transfer(msg.sender, 10000 * 1e18);
    }
}