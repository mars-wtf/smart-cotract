// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 *  Submitted for verification at basescan.org on 2024-03-25
 *
 * 888b      888       888      88888888b       c8888b
 *  8888    8888    88     88    88      88   88      88
 *  88 88  88 88   88       88   88      88   88
 *  88  8888  88   88 88888 88   88 8888Y       Y8888b
 *  88        88   88       88   88     88            88
 *  88        88   88       88   88      88   88      88
 * 888        88   88       88   88      88     Y8888Y           
 */

import from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IDecimals {
    error IncorrectDecimals();
    function decimals() external view returns (uint8);
}

contract EarlyLiquidity {

    /* -------------------------------------------------------------------------- */
    /*                                  constants                                 */
    /* -------------------------------------------------------------------------- */

    uint256 public constant USDC_DECIMALS = 6;
    uint256 public constant MARS_DECIMALS = 9;

    uint256 private _presalePrice = 10 ** 3; // 0.0001 USDC
    uint256 private _totalMarsSold;
    address public HOLDING_CONTRACT; //holding account
    // uint256 public constant MIN_TO_BUY = 10 ** MARS_DECIMALS * ;

    /* -------------------------------------------------------------------------- */
    /*                                 immutables                                 */
    /* -------------------------------------------------------------------------- */

    //USDC contract
    IERC20 public immutable USDC_TOKEN;
    // The MarsWFT token
    IERC20 public immutable MARS_WTF;

    address public admin;

    event Purchase(address indexed buyer, uint256 marsReceived, uint256 totalUSDCSpent);



    /**
     * Constructs the EarlyLiquidity contract
     * @param _usdcAddress The address of the USDC token
     * @param _holdingContract The address of the holding contract
     * @param _marsToken The address of the glow token
     */
    constructor(address _usdcAddress, address _holdingContract, address _marsToken)
    {
        USDC_TOKEN = IERC20(_usdcAddress);
        uint256 decimals = uint256(IDecimals(_usdcAddress).decimals());
        if (decimals != USDC_DECIMALS) {
            _revert(IDecimals.IncorrectDecimals.selector);
        }
        HOLDING_CONTRACT = _holdingContract;
        MARS_WTF = IERC20(_marsToken);
        
        admin = msg.sender;
        _totalMarsSold = 0;
    }

    modifier onlyManager() {
        require(msg.sender == admin, "only admin!");
        _;
    }

    function buy(uint256 amount) external {

        uint256 _minAmount = getMinAmountToPurchase ();
        require(amount >= _minAmount, "ERC20: min Amount for presale");

        uint256 marsToSend = amount; //amount to buy
        address _holdingContract = HOLDING_CONTRACT; //address to send USDC
        uint256 totalCost = getPrice(amount); //USDC amount

        // Check the balance of USDC in the miner pool before making a transfer.
        uint256 balBefore = USDC_TOKEN.balanceOf(_holdingContract);

        // Transfer USDC from the user to the miner pool to pay for the tokens.
        SafeERC20.safeTransferFrom(USDC_TOKEN, msg.sender, _holdingContract, totalCost);

        // Check the balance of USDC in the miner pool after the transfer to find the actual transferred amount.
        uint256 balAfter = USDC_TOKEN.balanceOf(_holdingContract);
        //Underflow should be impossible, unless the USDC contract is hacked and malicious
        //in which case, this transaction will revert
        //For almost all cases possible, this should not underflow/revert
        uint256 diff = balAfter - balBefore;

        require (diff == totalCost, "reverted because incorrect USDC transfer");

        // Transfer the desired amount of tokens to the user.
        SafeERC20.safeTransfer(MARS_WTF, msg.sender, marsToSend);

        // Update the total amount of tokens sold by adding the normalized amount to the total.
        _totalMarsSold += amount;

        // Emit an event to log the purchase details.
        emit Purchase(msg.sender, marsToSend, totalCost);

        // End of function; the explicit 'return' here is unnecessary but it indicates the function's conclusion.
        return;
    }

    function getPrice(uint256 amount) public view returns (uint256) {
        return amount * _presalePrice / 10 ** MARS_DECIMALS;
    }

    function getMinAmountToPurchase () public view returns (uint256) {
        return 10 ** MARS_DECIMALS / _presalePrice;
    }

    function getTotalMarsWTFSold() public view returns (uint256) {
        return _totalMarsSold;
    }

    function getPresalePrice () public view returns (uint256) {
        return _presalePrice;
    }

    function setPresalePrice (uint256 _price) external onlyManager {
        _presalePrice = _price;
    }

    function _revert(bytes4 selector) private pure {
        // solhint-disable-next-line no-inline-assembly
        assembly ("memory-safe") {
            mstore(0x0, selector)
            revert(0x0, 0x04)
        }
    }

    function setAdmin(address to) external onlyManager {
        admin = to;
    }

    function _isZeroAddress(address a) private pure returns (bool isZero) {
        // solhint-disable-next-line no-inline-assembly
        assembly ("memory-safe") {
            isZero := iszero(a)
        }
    }
}