import {BigNumber} from 'ethers';
import {ethers} from 'hardhat';
import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DappToken} from '../typechain';

const KEPT_BALANCE = 10000000; //ethers.utils.formatUnits(1000, 'ether');

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployer} = await hre.getNamedAccounts();
  const {deploy} = hre.deployments;
  //const useProxy = !hre.network.live;

  const tokenContract = <DappToken>await ethers.getContract('DappToken');

  const tokenFarm = await deploy('TokenFarm', {
    from: deployer,
    args: [tokenContract.address],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });
  const amountToTransfer = (await tokenContract.totalSupply()).sub(BigNumber.from(KEPT_BALANCE)); //.toNumber() - KEPT_BALANCE;
  console.log(`Transfering ${amountToTransfer} tokens to our token farm`);

  await tokenContract.transfer(tokenFarm.address, amountToTransfer, {from: deployer});

  // proxy only in non-live network (localhost and hardhat network) enabling HCR (Hot Contract Replacement)
  // in live network, proxy is disabled and constructor is invoked
  // await deploy('GreetingsRegistry', {
  //   from: deployer,
  //   proxy: useProxy && 'postUpgrade',
  //   args: [2],
  //   log: true,
  //   autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  // });

  // return !useProxy; // when live network, record the script as executed to prevent rexecution
};
export default func;
//func.id = 'deploy_greetings_registry'; // id required to prevent reexecution
func.tags = ['all', 'TokenFarm'];
