// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Counter {
    uint public count = 5;
    //1, 2, 3, .... but cant be -ve.

    

    function incrementCount() public {
        count += 1;
    }
}
