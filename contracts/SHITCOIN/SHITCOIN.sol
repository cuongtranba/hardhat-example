//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract SHITCOIN is ERC20, Pausable, AccessControl {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    mapping(address => bool) private _blackList;

    event BlackListAdded(address _account);
    event BlackListRemoved(address _account);

    constructor() ERC20("SHITCOIN", "SHT") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(PAUSER_ROLE, msg.sender);

        _mint(msg.sender, 1000000 * 10**decimals());
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function isBlackListed(address _account) public view returns (bool) {
        return _blackList[_account];
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        require(!_blackList[from], "Blacklisted spender account");
        require(!_blackList[to], "Blacklisted receiver account");
        super._beforeTokenTransfer(from, to, amount);
    }

    function addToBlackList(address _account)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_account != msg.sender, "Cannot add yourself to the blacklist");
        require(!_blackList[_account], "Account is already blacklisted");
        _blackList[_account] = true;

        emit BlackListAdded(_account);
    }

    function removeFromBlackList(address _account)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(
            _account != msg.sender,
            "Cannot remove yourself from the blacklist"
        );
        require(_blackList[_account], "Account is not blacklisted");
        _blackList[_account] = false;

        emit BlackListRemoved(_account);
    }
}
