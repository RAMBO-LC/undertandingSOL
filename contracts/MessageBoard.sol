// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MessageBoard {

    string public message;

    function setMessage(string memory _message) public  {
        message = _message;
    }

    function getMessage() private view returns (string memory) {
        return message;
    }
}