// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../Interfaces/AggregatorV3Interface.sol";

contract MockV3Aggregator is AggregatorV3Interface {
    int256 public _tokenPrice;

    constructor(int256 tokenPrice) {
        _tokenPrice = tokenPrice;
    }

    function decimals() external view returns (uint8) {
        return 0;
    }

    function description() external view returns (string memory) {
        return "Mock";
    }

    function version() external view returns (uint256) {
        return 0;
    }

    function getRoundData(uint80 _roundId)
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (_roundId, _tokenPrice, 0, 0, 0);
    }

    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (0, _tokenPrice, 0, 0, 0);
    }
}
