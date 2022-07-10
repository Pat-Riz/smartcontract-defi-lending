import {ethers} from 'hardhat';

const networkAddresses: {[network: string]: {[contract: string]: string}} = {
  kovan: {
    WethToken: '0x9BC4138EA5df2eB608b4D22Dc93FA11401a8b15f',
    FauToken: '0xFab46E002BbF0b4509813474841E0716E6730136',
    DAI_USD_Feed: '0x777A68032a88E5A84678A77Af2CD65A7b3c0775a',
    ETH_USD_Feed: '0x9326BFA02ADD2366b30bacB125260Af641031331',
  },
};

const contractsToMock: {[contract: string]: string} = {
  WethToken: 'MockWETH',
  FauToken: 'MockDAI',
  DaiToUsd: 'MockV3Aggregator',
  EthToUsd: 'MockV3Aggregator',
};

export const getContractAdress = async (network: string, contract: string): Promise<string> => {
  if (network === 'hardhat' || network === 'localhost') {
    const mockName = contractsToMock[contract];
    if (!mockName) {
      throw new Error('ERROR_NO_MOCK_FOUND');
    }
    const mock = await ethers.getContract(mockName);
    return mock.address;
  }

  return networkAddresses[network][contract];
};
