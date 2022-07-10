import {BigNumber} from 'ethers';
import {deployments, ethers, getNamedAccounts, getUnnamedAccounts} from 'hardhat';
import {Address} from 'hardhat-deploy/types';
import {setupAllowedTokens} from '../scripts/tokenFarmHelper';
import {DappToken, TokenFarm} from '../typechain';
import {MockV3Aggregator} from '../typechain/src/test/MockV3Aggregator';
import {expect} from './chai-setup';
import {setupUser, setupUsers} from './utils';

const AMOUNT_TO_STAKE = 100;

const setup = deployments.createFixture(async () => {
  await deployments.fixture('all');
  const {deployer, nonOwner} = await getNamedAccounts();
  const contracts = {
    TokenFarm: <TokenFarm>await ethers.getContract('TokenFarm'),
    DappToken: <DappToken>await ethers.getContract('DappToken'),
    MockV3Aggregator: <MockV3Aggregator>await ethers.getContract('MockV3Aggregator'),
  };
  const users = await setupUsers(await getUnnamedAccounts(), contracts);
  return {
    ...contracts,
    users,
    deployer: await setupUser(deployer, contracts),
    nonOwner: await setupUser(nonOwner, contracts),
  };
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stakeTokens = async (DappToken: DappToken, TokenFarm: TokenFarm, deployer: any, amount: number) => {
  await setupAllowedTokens();

  await deployer.DappToken.approve(TokenFarm.address, amount, {from: deployer.address});
  await deployer.TokenFarm.stakeTokens(BigNumber.from(amount), DappToken.address, {from: deployer.address});
};

describe('TokenFarm', function () {
  it('setPriceFeedContract works', async function () {
    const {TokenFarm, DappToken, MockV3Aggregator, deployer, nonOwner} = await setup();

    await deployer.TokenFarm.setPriceFeedContract(DappToken.address, MockV3Aggregator.address);
    expect(await TokenFarm._tokenToPriceFeed(DappToken.address)).to.be.equal(MockV3Aggregator.address);

    await expect(
      nonOwner.TokenFarm.setPriceFeedContract(DappToken.address, MockV3Aggregator.address)
    ).to.be.revertedWith('Ownable: caller is not the owner');
  });

  it('stakeTokens requires correctly', async function () {
    const {DappToken, deployer} = await setup();

    await expect(
      deployer.TokenFarm.stakeTokens(BigNumber.from(1000), DappToken.address, {from: deployer.address})
    ).to.be.revertedWith('Token is not allowed to be staked');

    await setupAllowedTokens();

    await expect(
      deployer.TokenFarm.stakeTokens(BigNumber.from(0), DappToken.address, {from: deployer.address})
    ).to.be.revertedWith('Amount must be more than 0');
  });
  it('stakeTokens works', async function () {
    const {TokenFarm, DappToken, deployer} = await setup();
    const myBalance = await DappToken.balanceOf(deployer.address);
    console.log('--> Balance BEFORE stake: ', myBalance.toString());

    stakeTokens(DappToken, TokenFarm, deployer.address, AMOUNT_TO_STAKE);

    const myBalance2 = await DappToken.balanceOf(deployer.address);
    console.log('--> Balance AFTER stake: ', myBalance2.toString());
    const stakers = await TokenFarm._uniqueTokensStaked(deployer.address);
    const stakingBalance = await TokenFarm._stakingBalance(DappToken.address, deployer.address);
    const allowedTOkens = await TokenFarm._allowedTokens(0);

    console.log('---> Tokens staked for me', stakers.toNumber());
    console.log('---> stakingBalance', stakingBalance.toNumber());
    console.log('---> allowedTOkens', allowedTOkens);

    // console.log('---> My DappBalance', myBalance.toNumber());
    expect(await deployer.TokenFarm._stakingBalance(DappToken.address, deployer.address)).to.be.equal(AMOUNT_TO_STAKE);
    expect(await deployer.TokenFarm._uniqueTokensStaked(deployer.address)).to.be.equal(1);
    expect(await deployer.TokenFarm._stakers(0)).to.be.equal(deployer.address);
  });

  it('unstakeTokens works', async function () {
    const {TokenFarm, DappToken, deployer} = await setup();

    stakeTokens(DappToken, TokenFarm, deployer, AMOUNT_TO_STAKE);

    await deployer.TokenFarm.unstakeToken(DappToken.address, {from: deployer.address});

    expect(await TokenFarm._stakingBalance(DappToken.address, deployer.address)).to.be.equal(0);
    expect(await TokenFarm._uniqueTokensStaked(deployer.address)).to.be.equal(0);
  });

  it('getUserTotalValue works', async function () {
    const {TokenFarm, DappToken, deployer} = await setup();

    stakeTokens(DappToken, TokenFarm, deployer, AMOUNT_TO_STAKE);
    await expect(await TokenFarm.getUserTotalValue(deployer.address)).to.be.equal(100);

    expect(await TokenFarm._stakingBalance(DappToken.address, deployer.address)).to.be.equal(0);
    expect(await TokenFarm._uniqueTokensStaked(deployer.address)).to.be.equal(0);
  });
});
