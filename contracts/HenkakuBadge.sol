//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract HenkakuBadge is ERC1155 {
    struct Badge {
       bool mintable;
       bool transerable;
       uint256 amount;
       string tokenURI;
    }

    uint256 tokenId;
    mapping(uint256 => Badge) bages;

    constructor() ERC1155('') { }

    function badges() view public returns (Badge[] memory) {
    }

    function badgeOf(address _of) public returns (Badge[] memory) {
    }

    // only by owner
    function createBadge() public {
    // it can be setBadge Attribute
    }

    // only by owner
    function setBadgeAttribute(uint256 _tokenId, Badge memory _badge) public {
    }

    function mint(uint256 _id, uint256 _amount) public {
    // require for all badge attribute exists
    // require amount is gte badge's amount to be piad
    // require mintable is true
    //  _mint(
    //     address to,
    //     uint256 id,
    //     uint256 amount,
    //     bytes memory data
    // )
    }

    // only by owner
    function mintByAdmin(uint256 _id, address _to) public {
    // require for all badge attribute exists
    // require mitable is false ?
    //  _mint(
    //     address to,
    //     uint256 id,
    //     uint256 amount,
    //     bytes memory data
    // )
    }

    // or use before transfer
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public virtual override {
    // reuqire badge's transfer attribute to be true
    }

    // of can be token id or address
    function burn(uint256 _tokenId, address _of) public{

    }

    function uri(uint256 _tokenId) override public view returns (string memory) {
        return bages[_tokenId].tokenURI;
    }
}
