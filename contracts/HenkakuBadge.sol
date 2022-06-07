//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract HenkakuBadge is ERC1155, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Badge {
        bool mintable;
        bool transerable;
        uint256 amount;
        string tokenURI;
    }

    mapping(uint256 => Badge) public bages;

    constructor() ERC1155("") {}

    function badges() public view returns (Badge[] memory) {}

    function badgeOf(address _of) public returns (Badge[] memory) {}

    event NewBadge(uint256 indexed id, bool mintable, uint256 amount);

    function createBadge(Badge memory _badge) public onlyOwner {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        bages[newItemId] = _badge;
        emit NewBadge(newItemId, _badge.mintable, _badge.amount);
    }

    // only by owner
    function setBadgeAttribute(uint256 _tokenId, Badge memory _badge) public {}

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
    function burn(uint256 _tokenId, address _of) public {}

    function uri(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        return bages[_tokenId].tokenURI;
    }
}
