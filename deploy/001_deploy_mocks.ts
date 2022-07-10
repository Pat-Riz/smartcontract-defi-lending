import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import {network} from 'hardhat';
import {log} from 'console';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy} = deployments;

  const {deployer} = await getNamedAccounts();

  log(`Testing.... Network name: ${network.name}`);
  // If we are on a local development network, we need to deploy mocks!
  if (network.name === 'hardhat' || network.name === 'localhost') {
    log('Local network detected! Deploying mocks...');

    await deploy('MockV3Aggregator', {
      contract: 'MockV3Aggregator',
      from: deployer,
      log: true,
      //args: [DECIMALS, INITIAL_PRICE],
      args: [1000],
    });

    await deploy('MockDAI', {
      contract: 'MockDAI',
      from: deployer,
      log: true,
    });

    await deploy('MockWETH', {
      contract: 'MockWETH',
      from: deployer,
      log: true,
    });

    log('Mocks Deployed!');
    log('----------------------------------------------------');
    log("You are deploying to a local network, you'll need a local network running to interact");
    log('----------------------------------------------------');
  }
};
export default func;
module.exports.tags = ['all', 'mocks', 'main'];
