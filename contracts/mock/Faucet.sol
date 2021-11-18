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

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
    Golden Banana Faucet
 */
contract Faucet is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 public faucetToken;
    uint public transferAmount = 10000 * 1e18;

    constructor(
        IERC20 _faucetToken
    ) public {
        faucetToken = _faucetToken;
    }

    function getToken() external {
        faucetToken.safeTransfer(address(msg.sender), transferAmount);
    }

    function adjustTransferAmount(uint256 _amount) external onlyOwner {
        transferAmount = _amount;
    }
}