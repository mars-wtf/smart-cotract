/**
 *Submitted for verification at basescan.org on 2024-03-20
 */

// SPDX-License-Identifier: MIT
/**
 *  Submitted for verification at basescan.org on 2024-03-20
 *
 * 888        88  8888888888  8888888888       888       88       888      888       8888888888
 *  88        88      88       88               88       88    88     88    88           88
 *  88        88      88       88   88          88       88   88       88   88           88
 *  88        88      88       8888888          88       88   88 88888 88   88           88
 *  88   88   88      88       88   88          88       88   88       88   88           88
 *   88 8  8 88       88       88                88     88    88       88   88           88
 *     88  88         88       88                   888       88       88   888888888    88
 *
 *
 * Multi Signature Wallet for MarsWTF meme coin platform.
 *
 *  We got the goods.  Let's go change the culture!
 *  https://marscoin.wtf
 **/
pragma solidity ^0.8.19;

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract VaultMarsWTF {
    event Deposit(address indexed sender, uint256 amount, uint256 balance);
    //manager transaction events
    event SubmitManagerTransaction(
        address indexed owner,
        uint256 indexed txIndex,
        address indexed manager,
        bool action,
        bytes data
    );
    event ConfirmManagerTransaction(
        address indexed owner,
        uint256 indexed txIndex
    );
    event RevokeManagerConfirmation(
        address indexed owner,
        uint256 indexed txIndex
    );
    event ExecuteManagerTransaction(
        address indexed owner,
        uint256 indexed txIndex
    );
    //USDC transaction events
    event SubmitUSDCTransaction(
        address indexed owner,
        uint256 indexed txIndex,
        address indexed to,
        uint256 amount,
        bytes data
    );
    event ConfirmUSDCTransaction(
        address indexed owner,
        uint256 indexed txIndex
    );
    event RevokeUSDCConfirmation(
        address indexed owner,
        uint256 indexed txIndex
    );
    event ExecuteUSDCTransaction(
        address indexed owner,
        uint256 indexed txIndex
    );
    //public
    address[] public managers; //managers
    address public owner; //contract owner
    mapping(address => bool) public isManager;
    uint256 public numConfirmationsRequired;
    /* ------------------------------ transaction struct ------------------------------- */
    struct USDCTransaction {
        address to;
        uint256 amount;
        bytes data;
        bool executed;
        uint256 numConfirmations;
    }
    struct ManagerTransaction {
        address manager;
        bool action;
        bytes data;
        bool executed;
        uint256 numConfirmations;
    }
    //immutables
    IERC20 public immutable USDC_TOKEN;
    // mapping from tx index => manager => bool
    mapping(uint256 => mapping(address => bool)) public usdcIsConfirmed;
    mapping(uint256 => mapping(address => bool)) public managerIsConfirmed;
    //transactions
    USDCTransaction[] public usdcTransactions;
    ManagerTransaction[] public managerTransactions;
    //owner & manager modifier
    modifier onlyManager() {
        require(isManager[msg.sender], "Not manager");
        _;
    }
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    //manager transaction modifiers
    modifier managerTxExists(uint256 _txIndex) {
        require(_txIndex < managerTransactions.length, "Trx does not exist");
        _;
    }
    modifier managerNotExecuted(uint256 _txIndex) {
        require(!managerTransactions[_txIndex].executed, "Trx already executed");
        _;
    }
    modifier managerNotConfirmed(uint256 _txIndex) {
        require(
            !managerIsConfirmed[_txIndex][msg.sender],
            "tx already confirmed"
        );
        _;
    }
    //usdc transaction modifiers
    modifier usdcTxExists(uint256 _txIndex) {
        require(_txIndex < usdcTransactions.length, "Trx does not exist");
        _;
    }
    modifier usdcNotExecuted(uint256 _txIndex) {
        require(!usdcTransactions[_txIndex].executed, "Trx already executed");
        _;
    }
    modifier usdcNotConfirmed(uint256 _txIndex) {
        require(!usdcIsConfirmed[_txIndex][msg.sender], "Trx already confirmed");
        _;
    }
    constructor(
        address[] memory _managers,
        address _usdcAddress,
        uint256 _numConfirmationsRequired
    ) {
        require(_managers.length > 0, "managers required");
        require(
            _numConfirmationsRequired > 0 &&
                _numConfirmationsRequired <= _managers.length + 1,
            "Invalid number of required confirmations"
        );
        owner = msg.sender;
        isManager[owner] = true;
        managers.push(owner);
        for (uint256 i = 0; i < _managers.length; i++) {
            address _manager = _managers[i];
            require(
                _manager != address(0),
                "Invalid manager, not zero address"
            );
            require(!isManager[_manager], "Manager not unique");
            isManager[_manager] = true;
            managers.push(_manager);
        }
        numConfirmationsRequired = _numConfirmationsRequired;
        USDC_TOKEN = IERC20(_usdcAddress);
    }
    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }
    function setOwner(address _owner) external onlyOwner {
        owner = _owner;
        isManager[owner] = true;
        managers.push(owner);
    }
    function submitManagerTransaction(
        address _manager,
        bool _action,
        bytes memory _data
    ) public onlyOwner {
        require(_manager != owner, "Owner");
        require(_manager != address(0), "Invalid manager, not zero address");

        if (_action) require(!isManager[_manager], "Not Manager");
        else require(isManager[_manager], "Already Manager");

        uint256 txIndex = managerTransactions.length;
        managerTransactions.push(
            ManagerTransaction({
                manager: _manager,
                action: _action,
                data: _data,
                executed: false,
                numConfirmations: 0
            })
        );
        emit SubmitManagerTransaction(
            msg.sender,
            txIndex,
            _manager,
            _action,
            _data
        );
    }
    function submitUSDCTransaction(
        address _to,
        uint256 _amount,
        bytes memory _data
    ) public onlyManager {
        uint256 txIndex = usdcTransactions.length;
        uint256 _balance = USDC_TOKEN.balanceOf(address(this));

        require(_balance >= _amount, "Transfer amount overflows balance");

        usdcTransactions.push(
            USDCTransaction({
                to: _to,
                amount: _amount,
                data: _data,
                executed: false,
                numConfirmations: 0
            })
        );
        emit SubmitUSDCTransaction(msg.sender, txIndex, _to, _amount, _data);
    }
    function confirmManagerTransaction(
        uint256 _txIndex
    )
        public
        onlyManager
        managerTxExists(_txIndex)
        managerNotConfirmed(_txIndex)
        managerNotConfirmed(_txIndex)
    {
        ManagerTransaction storage transaction = managerTransactions[_txIndex];
        transaction.numConfirmations += 1;
        managerIsConfirmed[_txIndex][msg.sender] = true;
        emit ConfirmManagerTransaction(msg.sender, _txIndex);
    }
    function confirmUSDCTransaction(
        uint256 _txIndex
    )
        public
        onlyManager
        usdcTxExists(_txIndex)
        usdcNotExecuted(_txIndex)
        usdcNotConfirmed(_txIndex)
    {
        USDCTransaction storage transaction = usdcTransactions[_txIndex];
        transaction.numConfirmations += 1;
        usdcIsConfirmed[_txIndex][msg.sender] = true;
        emit ConfirmUSDCTransaction(msg.sender, _txIndex);
    }
    function executeManagerTransaction(
        uint256 _txIndex
    )
        public
        onlyManager
        managerTxExists(_txIndex)
        managerNotExecuted(_txIndex)
    {
        ManagerTransaction storage transaction = managerTransactions[_txIndex];
        require(
            transaction.numConfirmations >= numConfirmationsRequired,
            "cannot execute tx as less confirmations"
        );
        transaction.executed = true;
        if (transaction.action) {
            isManager[transaction.manager] = true;
            managers.push(transaction.manager);
        } else {
            isManager[transaction.manager] = false;
        }
        emit ExecuteManagerTransaction(msg.sender, _txIndex);
    }
    function executeUSDCTransaction(
        uint256 _txIndex
    ) public onlyManager usdcTxExists(_txIndex) usdcNotExecuted(_txIndex) {
        USDCTransaction storage transaction = usdcTransactions[_txIndex];
        require(
            transaction.numConfirmations >= numConfirmationsRequired,
            "cannot execute tx as less confirmations"
        );
        transaction.executed = true;
        bool success = USDC_TOKEN.approve(address(this), transaction.amount);
        require(success, "approve failed");
        SafeERC20.safeTransferFrom(
            USDC_TOKEN,
            address(this),
            transaction.to,
            transaction.amount
        );
        emit ExecuteUSDCTransaction(msg.sender, _txIndex);
    }
    function revokManagerConfirmation(
        uint256 _txIndex
    )
        public
        onlyManager
        managerTxExists(_txIndex)
        managerNotExecuted(_txIndex)
    {
        ManagerTransaction storage transaction = managerTransactions[_txIndex];
        require(managerIsConfirmed[_txIndex][msg.sender], "tx not confirmed");
        transaction.numConfirmations -= 1;
        managerIsConfirmed[_txIndex][msg.sender] = false;
        emit RevokeManagerConfirmation(msg.sender, _txIndex);
    }
    function revokeUSDCConfirmation(
        uint256 _txIndex
    ) public onlyManager usdcTxExists(_txIndex) usdcNotExecuted(_txIndex) {
        USDCTransaction storage transaction = usdcTransactions[_txIndex];
        require(usdcIsConfirmed[_txIndex][msg.sender], "tx not confirmed");
        transaction.numConfirmations -= 1;
        usdcIsConfirmed[_txIndex][msg.sender] = false;
        emit RevokeUSDCConfirmation(msg.sender, _txIndex);
    }
    function getManagers() public view returns (address[] memory) {
        address[] memory _managers = new address[](managers.length);
        uint256 count = 0;
        for (uint256 i = 0; i < managers.length; i++) {
            if (isManager[managers[i]]) {
                _managers[count] = managers[i];
                count++;
            }
        }

        assembly {
            mstore(_managers, count)
        }

        return _managers;
    }
    function getUSDCTransactions()
        public
        view
        returns (USDCTransaction[] memory)
    {
        return usdcTransactions;
    }
    function getManagerTransactions()
        public
        view
        returns (ManagerTransaction[] memory)
    {
        return managerTransactions;
    }
    function getManagerTransactionCount() public view returns (uint256) {
        return managerTransactions.length;
    }
    function getUSDCTransactionCount() public view returns (uint256) {
        return usdcTransactions.length;
    }
    function balanceUSDC() public view returns (uint256) {
        return USDC_TOKEN.balanceOf(address(this));
    }
    function getManagerTransaction(
        uint256 _txIndex
    )
        public
        view
        returns (
            address manger,
            bool action,
            bytes memory data,
            bool executed,
            uint256 numConfirmations
        )
    {
        ManagerTransaction storage transaction = managerTransactions[_txIndex];
        return (
            transaction.manager,
            transaction.action,
            transaction.data,
            transaction.executed,
            transaction.numConfirmations
        );
    }
    function getUSDCTransaction(
        uint256 _txIndex
    )
        public
        view
        returns (
            address to,
            uint256 amount,
            bytes memory data,
            bool executed,
            uint256 numConfirmations
        )
    {
        USDCTransaction storage transaction = usdcTransactions[_txIndex];
        return (
            transaction.to,
            transaction.amount,
            transaction.data,
            transaction.executed,
            transaction.numConfirmations
        );
    }
}
