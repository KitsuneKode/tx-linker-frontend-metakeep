import { Address } from 'web3';

export interface ContractFunction {
  name: string;
  inputs: FunctionInput[];
  outputs: FunctionOutput[];
  stateMutability: string;
  type: string;
}

export interface FunctionInput {
  name: string;
  type: string;
  internalType?: string;
  components?: FunctionInput[];
}

export interface FunctionOutput {
  name: string;
  type: string;
  internalType?: string;
  components?: FunctionOutput[];
}

export interface TransactionDetails {
  contractAddress: string;
  chainId: number;
  rpcUrl: string;
  functionName: string;
  functionInputs: { [key: string]: string };
  abi?: string;
}

export interface MetaKeepConfig {
  clientId: string;
  chain: {
    id: number;
    rpcUrl: string;
  };
}

export interface ChainOption {
  id: number;
  name: string;
  rpcUrl: string;
}

export const SUPPORTED_CHAINS: ChainOption[] = [
  {
    id: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://ethereum.publicnode.com',
  },
  { id: 5, name: 'Goerli Testnet', rpcUrl: 'https://goerli.infura.io/v3/' },
  { id: 137, name: 'Polygon Mainnet', rpcUrl: 'https://polygon-rpc.com' },
  {
    id: 80001,
    name: 'Mumbai Testnet',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
  },
  { id: 42161, name: 'Arbitrum One', rpcUrl: 'https://arb1.arbitrum.io/rpc' },
  {
    id: 43114,
    name: 'Avalanche C-Chain',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
  },
  {
    id: 56,
    name: 'BNB Smart Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org',
  },
];
