// SPDX-License-Identifier: AGPL-1.0
pragma solidity 0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "hardhat/console.sol";

contract TokenFarm is Ownable {
    // mapping token address -> staker address -> amount
    mapping(address => mapping(address => uint256)) public _stakingBalance;
    mapping(address => uint256) public _uniqueTokensStaked;
    mapping(address => address) public _tokenToPriceFeed;
    address[] public _allowedTokens;
    address[] public _stakers;
    IERC20 public _dapptoken;

    //address[] stakers;
    constructor(address dappTokenAddress) {
        _dapptoken = IERC20(dappTokenAddress);
    }

    function issueTokens() public onlyOwner {
        for (uint256 i = 0; i < _stakers.length; i++) {
            address recipient = _stakers[i];
            _dapptoken.transfer(recipient, getUserTotalValue(recipient));
        }
    }

    function unstakeToken(address token) public {
        uint256 balance = _stakingBalance[token][msg.sender];
        require(balance > 0, "Staking balance cannot be 0");
        IERC20(token).transfer(msg.sender, balance);
        _stakingBalance[token][msg.sender] = 0;
        _uniqueTokensStaked[msg.sender] = _uniqueTokensStaked[msg.sender] - 1;
    }

    //For a "real" implementation we wouldent transfer funds directly. Users would have to manually claim rewards to save gas fees.
    function getUserTotalValue(address user) public view returns (uint256) {
        uint256 totalValue = 0;
        require(_uniqueTokensStaked[user] > 0, "No tokens staked!");
        for (uint256 i = 0; i < _allowedTokens.length; i++) {
            totalValue += getUserSingleTokenValue(user, _allowedTokens[i]);
        }
        return totalValue;
    }

    function updateUniqueTokensStaked(address _user, address _token) internal {
        if (_stakingBalance[_token][_user] <= 0) {
            _uniqueTokensStaked[_user] = _uniqueTokensStaked[_user] + 1;
        }
    }

    function getUserSingleTokenValue(address user, address token) public view returns (uint256) {
        if (_uniqueTokensStaked[user] <= 0) return 0;
        // get price of token * stakingBalance[token][user]
        (uint256 price, uint256 decimals) = getTokenValue(token);
        return ((_stakingBalance[token][user] * price) / (10**decimals));
    }

    function getTokenValue(address token) public view returns (uint256, uint256) {
        address priceFeedAddress = _tokenToPriceFeed[token];
        AggregatorV3Interface priceFeed = AggregatorV3Interface(priceFeedAddress);
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return (uint256(price), uint256(priceFeed.decimals()));
    }

    function stakeTokens(uint256 amount, address token) public {
        require(amount > 0, "Amount must be more than 0");
        require(tokenIsAllowed(token), "Token is not allowed to be staked");

        console.log("---> Test from stakeTokens...");
        // console.log("Transferring from %s to %s %s tokens", msg.sender, address(this), amount);

        IERC20(token).transferFrom(msg.sender, address(this), amount);
        updateUniqueTokensStaked(msg.sender, token);
        _stakingBalance[token][msg.sender] = _stakingBalance[token][msg.sender] + amount;
        if (_uniqueTokensStaked[msg.sender] == 1) {
            _stakers.push(msg.sender);
        }
    }

    function issueToken() public onlyOwner {
        for (uint256 i = 0; i < _stakers.length; i++) {
            address recipient = _stakers[i];
            uint256 userTotalValue = getUserTotalValue(recipient);
            _dapptoken.transfer(recipient, userTotalValue);
        }
    }

    function addAllowedTokens(address token) public onlyOwner {
        _allowedTokens.push(token);
    }

    function setPriceFeedContract(address token, address pricefeed) public onlyOwner {
        _tokenToPriceFeed[token] = pricefeed;
    }

    function tokenIsAllowed(address token) public view returns (bool) {
        for (uint256 i = 0; i < _allowedTokens.length; i++) {
            if (_allowedTokens[i] == token) {
                return true;
            }
        }
        return false;
    }
}
