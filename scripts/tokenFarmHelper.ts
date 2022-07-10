import {TokenFarm, DappToken} from '../typechain';
import {ethers, getNamedAccounts, network} from 'hardhat';
import {Address} from 'hardhat-deploy/types';
import {getContractAdress} from './helpfulScrips';

interface tokenInformation {
  token: Address;
  pricefeed: Address;
}

const WETH_ADDRESS = '0x9BC4138EA5df2eB608b4D22Dc93FA11401a8b15f';
const FAU_ADDRESS = '0xFab46E002BbF0b4509813474841E0716E6730136';
const DAI_USD = '0x777A68032a88E5A84678A77Af2CD65A7b3c0775a';
const ETH_USD = '	0x9326BFA02ADD2366b30bacB125260Af641031331';

export async function setupAllowedTokens() {
  const {deployer} = await getNamedAccounts();

  const TokenFarm = <TokenFarm>await ethers.getContract('TokenFarm');
  const DappToken = <DappToken>await ethers.getContract('DappToken');
  const tokens: tokenInformation[] = []; // = [{token: DappToken.address, pricefeed: MockV3Aggregator.address}];

  const wethToken = await getContractAdress(network.name, 'WethToken');
  const ethToUsd = await getContractAdress(network.name, 'EthToUsd');
  const fauToken = await getContractAdress(network.name, 'FauToken');
  const daiToUsd = await getContractAdress(network.name, 'DaiToUsd');

  tokens.push({token: DappToken.address, pricefeed: daiToUsd});
  tokens.push({token: fauToken, pricefeed: daiToUsd});
  tokens.push({token: wethToken, pricefeed: ethToUsd});

  await addAllowedTokens(TokenFarm, tokens, deployer);
}

const addAllowedTokens = async (tokenFarm: TokenFarm, tokens: tokenInformation[], account: string) => {
  for (const token of tokens) {
    await tokenFarm.addAllowedTokens(token.token, {from: account});
    await tokenFarm.setPriceFeedContract(token.token, token.pricefeed, {from: account});
  }
};

setupAllowedTokens()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
