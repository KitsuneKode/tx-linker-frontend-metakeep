import React from 'react';
import { TransactionDetails as TransactionDetailsType } from '@/lib/types';
import { parseABI } from '@/lib/metakeep';

interface TransactionDetailsProps {
  transaction: TransactionDetailsType;
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  transaction,
}) => {
  const { contractAddress, chainId, functionName, functionInputs, abi } =
    transaction;

  // Get function details from ABI
  const getFunction = () => {
    try {
      const parsedABI = parseABI(abi);
      if (!parsedABI) return null;

      return parsedABI.find(
        (item) => item.type === 'function' && item.name === functionName
      );
    } catch (error) {
      console.error('Failed to parse ABI:', error);
      return null;
    }
  };

  const functionABI = getFunction();

  // Get network name from chain ID
  const getNetworkName = (id: number) => {
    const networks: { [key: number]: string } = {
      1: 'Ethereum Mainnet',
      5: 'Goerli Testnet',
      137: 'Polygon Mainnet',
      80001: 'Mumbai Testnet',
      42161: 'Arbitrum One',
      43114: 'Avalanche C-Chain',
      56: 'BNB Smart Chain',
    };

    return networks[id] || `Chain ID: ${id}`;
  };

  return (
    <div className="w-full glass-panel p-6 space-y-6 animate-slide-up shadow-lg">
      <h3 className="text-xl font-medium">Transaction Details</h3>

      <div className="space-y-4">
        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">
            Contract
          </span>
          <p className="font-mono text-sm">{contractAddress}</p>
        </div>

        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">
            Network
          </span>
          <p>{getNetworkName(chainId)}</p>
        </div>

        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">
            Function
          </span>
          <p className="font-semibold">{functionName}</p>
          {functionABI && (
            <div className="bg-secondary p-3 rounded-md mt-2">
              <p className="text-sm font-mono break-all">
                {functionName}(
                {functionABI.inputs
                  .map((input, index: number) => {
                    const value = functionInputs[input.name];
                    return `${input.type} ${input.name}${
                      value ? ': ' + value : ''
                    }${index < functionABI.inputs.length - 1 ? ', ' : ''}`;
                  })
                  .join('')}
                )
              </p>
            </div>
          )}
        </div>

        {functionABI && functionABI.inputs.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">
              Parameters
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {functionABI.inputs.map((input, index: number) => (
                <div key={index} className="bg-secondary/50 p-3 rounded-md">
                  <p className="text-xs text-muted-foreground">{input.type}</p>
                  <p className="text-sm font-medium">{input.name}</p>
                  <p className="text-sm font-mono truncate">
                    {functionInputs[input.name]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionDetails;
