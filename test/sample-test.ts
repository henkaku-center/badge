import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('HenkakuBadge', function () {
  it('sample', async function () {
    const Badge = await ethers.getContractFactory('HenkakuBadge')
    const badge = await Badge.deploy()
    await badge.deployed()
    expect(1).to.equal(1)
  })
})
