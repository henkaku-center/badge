//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract HenkakuBadge is ERC1155, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    uint256 public immutable tokenAmount = 1;
    IERC20 public erc20;

    struct Badge {
        bool mintable;
        bool transferable;
        uint256 amount;
        string tokenURI;
    }

    mapping(uint256 => Badge) public badges;
    mapping(address => Badge[]) private userBadges;

    constructor(address _erc20) ERC1155("") {
        setERC20(_erc20);
    }

    function getBadges() public view returns (Badge[] memory) {
        Badge[] memory badgeArray = new Badge[](_tokenIds.current());
        for (uint256 i = 0; i < _tokenIds.current(); i++) {
            badgeArray[i] = badges[i + 1];
        }
        return badgeArray;
    }

    function badgesOf(address _of) public view returns (Badge[] memory) {
        return userBadges[_of];
    }

    event NewBadge(uint256 indexed id, bool mintable, uint256 amount);
    event UpdateBadge(uint256 indexed id, bool mintable);

    modifier onlyExistBadge(uint256 _tokenId) {
        require(
            _tokenId > 0 && _tokenId <= _tokenIds.current(),
            "Badge Not Exists"
        );
        _;
    }

    modifier onlyHolder(address _of, uint256 _tokenId) {
        require(balanceOf(_of, _tokenId) > 0, "Invalid: NOT HOLDER");
        _;
    }

    function setERC20(address _addr) public onlyOwner {
        erc20 = IERC20(_addr);
    }

    function createBadge(Badge memory _badge) public onlyOwner {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        badges[newItemId] = _badge;
        emit NewBadge(newItemId, _badge.mintable, _badge.amount);
    }

    function updateBadgeAttr(
        uint256 _tokenId,
        bool _mintable,
        string memory _tokenURI
    ) public onlyOwner onlyExistBadge(_tokenId) {
        badges[_tokenId].mintable = _mintable;
        badges[_tokenId].tokenURI = _tokenURI;
        emit UpdateBadge(_tokenId, _mintable);
    }

    function mint(uint256 _tokenId) public onlyExistBadge(_tokenId) {
        require(
            erc20.balanceOf(msg.sender) >= badges[_tokenId].amount,
            "INSUFFICIENT BALANCE"
        );
        bool success = erc20.transferFrom(
            msg.sender,
            address(this),
            badges[_tokenId].amount
        );
        require(success, "TX FAILED");
        _mint(msg.sender, _tokenId, tokenAmount, "");
        userBadges[msg.sender].push(badges[_tokenId]);
    }

    // only by owner
    function mintByAdmin(uint256 _tokenId, address _to)
        public
        onlyOwner
        onlyExistBadge(_tokenId)
    {
        _mint(_to, _tokenId, tokenAmount, "");
        userBadges[_to].push(badges[_tokenId]);
    }

    // or use before transfer
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        uint256 _amount,
        bytes memory _data
    ) public virtual override onlyExistBadge(_tokenId) {
        require(badges[_tokenId].transferable, "TRANSFER FORBIDDEN");

        _safeTransferFrom(_from, _to, _tokenId, _amount, _data);
    }

    function burn(uint256 _tokenId, address _of)
        public
        onlyExistBadge(_tokenId)
        onlyHolder(_of, _tokenId)
    {
        require(
            msg.sender == owner() || msg.sender == _of,
            "NOT HAVE AUTHORITY"
        );
        _burn(_of, _tokenId, tokenAmount);
    }

    function uri(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        return badges[_tokenId].tokenURI;
    }
}
