pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// import "@nomiclabs/buidler/console.sol";

// 4 numbers
contract Treasoury is Ownable {
    using SafeMath for uint256;
    using SafeMath for uint8;
    using SafeERC20 for IERC20;

    address constant burnAddress = address(0x000000000000000000000000000000000000dEaD);

    // The TOKEN to buy
    IERC20 public banana;
    // The TOKEN to sell
    IERC20 public goldenBanana;
    // adminAddress
    address public adminAddress;
    // buyFee, if decimal is not 18, please reset it
    uint256 public buyFee = 30; // 30% or 0.30 Banana
    // sellPrice, if decimal is not 18, please reset it
    uint256 public sellPrice = 100; // 100% or 1 Banana

    // =================================
    uint256 bananaReserve = 0;
    uint256 goldenBananaReserve = 0;

    event Buy(address indexed user, uint256 amount);
    event Sell(address indexed user, uint256 amount);

    constructor(
        IERC20 _banana,
        IERC20 _goldenBanana
    ) public {
        banana = _banana;
        goldenBanana = _goldenBanana;
        adminAddress = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == adminAddress, "admin: wut?");
        _;
    }

    uint private unlocked = 1;
    modifier lock() {
        require(unlocked == 1, 'ApeSwap: LOCKED');
        unlocked = 0;
        _;
        unlocked = 1;
    }

    function buy(uint256 _amount) external lock {
        banana.safeTransferFrom(address(msg.sender), address(this), _amount);
        uint256 bananaToBurn = _amount.mul(buyFee).div(100);
        uint256 goldenBananaToSend = _amount.sub(bananaToBurn);
        goldenBanana.transfer(address(msg.sender), goldenBananaToSend);
        bananaReserve = bananaReserve.add(goldenBananaToSend);
        goldenBananaReserve = goldenBananaReserve.sub(goldenBananaToSend);
        _burnBananas(bananaToBurn);
        emit Buy(msg.sender, _amount);
    }

    function sell(uint256 _amount) external lock {
        // TODO golden Banana safeTransferFrom ?
        goldenBanana.transferFrom(address(msg.sender), address(this), _amount);
        uint balance = goldenBanana.balanceOf(address(this));
        uint amountIn = balance.sub(goldenBananaReserve);
        goldenBananaReserve = goldenBananaReserve.add(amountIn);
        uint256 bananaToSend = amountIn.mul(sellPrice).div(100);
        goldenBananaReserve = bananaReserve.sub(bananaToSend);
        banana.transfer(address(msg.sender), bananaToSend);
        emit Sell(msg.sender, _amount);
    }

    function _burnBananas(uint256 _amount) internal {
        banana.transfer(burnAddress, _amount);
    }

    // Update admin address by the previous dev.
    function setAdmin(address _adminAddress) public onlyOwner {
        adminAddress = _adminAddress;
    }

    // Withdraw without caring about rewards. EMERGENCY ONLY.
    function adminWithdraw(uint256 _amount) public onlyOwner {
        goldenBanana.transferFrom(address(this), address(msg.sender), _amount);
    }

    // Set the minimum price for one ticket
    function setBuyFee(uint256 _price) external onlyAdmin {
        buyFee = _price;
    }

        // Set the minimum price for one ticket
    function setSellPrice(uint256 _price) external onlyAdmin {
        sellPrice = _price;
    }

    // force reserves to match balances
    function sync() external lock {
        goldenBananaReserve = goldenBanana.balanceOf(address(this));
        bananaReserve = banana.balanceOf(address(this));
    }

}