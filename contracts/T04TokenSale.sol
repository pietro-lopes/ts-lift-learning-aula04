// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

contract T04TokenSale {
    constructor(address token) {
        liftToken = IERC20Metadata(token);
        owner = payable(msg.sender);
    }

    IERC20Metadata private liftToken;
    address payable public owner;
    uint8 private liftDecimals = liftToken.decimals();
    uint8 private constant maticDecimals = 18;
    uint256 public constant minBuy = 10**9; // 1 GWEI
    uint256 public constant maxBuy = 10**18; // 1 ETHER

    function buy1pra1() public payable returns (bool) {
        require(
            maxBuy >= msg.value,
            "Por favor, tenha pena do seu rico dinheirinho..."
        );
        require(
            minBuy <= msg.value,
            unicode"Por favor, não seja tão mão de vaca, pelo menos 1 gwei..."
        );

        bool success = liftToken.transferFrom(
            owner,
            msg.sender,
            msg.value / 10**(maticDecimals - liftDecimals)
        );
        require(success, "Transfer failed...");
        owner.transfer(msg.value);
        emit Sold(msg.sender, msg.value / 10**(maticDecimals - liftDecimals));
        return true;
    }

    event Sold(address indexed to, uint amount);
}
