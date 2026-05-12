// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Counter {
    uint count;
    //1, 2, 3, .... but cant be -ve.

    constructor() public {
        count = 0;
    }

    function getCount() public view returns(uint) {
        return count;
    }

    function incrementCount() public {
        count += 1;
    }
}
