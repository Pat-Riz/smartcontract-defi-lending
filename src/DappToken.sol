// SPDX-License-Identifier: AGPL-1.0
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Libraries/Constants.sol";

contract DappToken is ERC20 {
    constructor() ERC20("Dapp token", "DAPP") {
        _mint(msg.sender, Constants.DECIMALS_18);
    }
}
