//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;
import "./IERC20.sol";

contract CUG is IERC20 {
    uint256 private _totalSupply;

    //mapping[address] => balancer;
    mapping(address => uint256) private _balancer;

    //mapping[sender][spender] => _allowancer;
    mapping(address => mapping(address => uint256)) private _allowancer;

    constructor() {
        _totalSupply = 1000000;
        _balancer[msg.sender] = _totalSupply;
    }

    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return _balancer[account];
    }

    function transfer(address recipient, uint256 amount)
        public
        override
        returns (bool)
    {
        require(amount > 0);
        require(_balancer[msg.sender] >= amount);

        _balancer[msg.sender] -= amount;
        _balancer[recipient] += amount;

        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    function allowance(address owner, address spender)
        public
        view
        override
        returns (uint256)
    {
        return _allowancer[owner][spender];
    }

    function approve(address spender, uint256 amount)
        public
        override
        returns (bool)
    {
        _allowancer[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);

        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public override returns (bool) {
        require(amount > 0);
        require(_balancer[sender] >= amount);
        require(_allowancer[sender][msg.sender] >= amount);

        _balancer[sender] -= amount;
        _balancer[recipient] += amount;

        emit Transfer(sender, recipient, amount);
        return true;
    }
}
