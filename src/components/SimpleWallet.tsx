import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { logTransactionEvent } from '@/lib/metakeep';
import { MetaKeep } from 'metakeep';
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';

interface SimpleWalletProps {
  transactionDetails?: {
    contractAddress: string;
    chainId: number;
    functionName: string;
    functionInputs: { [key: string]: string };
    rpcUrl: string;
    data: string;
    isReadOnly?: boolean;
    outputType?: string[];
  };
}

const SimpleWallet: React.FC<SimpleWalletProps> = ({ transactionDetails }) => {
  const [response, setResponse] = useState<string | null>(null);
  const [signResponse, setSignResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [metaKeep, setMetaKeep] = useState(null);
  const [web3, setWeb3] = useState<Web3>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Initialize MetaKeep SDK
  useEffect(() => {
    const initSDK = async () => {
      try {
        const chainId = transactionDetails?.chainId || 80001; // Default to Mumbai Testnet

        const metakeepInstance = new MetaKeep({
          appId: '9cc98bca-da35-4da8-8f10-655b3e51cb9e',
          chainId,
          rpcNodeUrls: { [chainId]: transactionDetails.rpcUrl },
        });

        setMetaKeep(metakeepInstance);

        console.log('Initializing MetaKeep Web3 provider');
        const web3Provider = await metakeepInstance.ethereum;
        const web3Instance = new Web3(web3Provider);

        const accounts = await web3Instance.eth.getAccounts();
        console.log(accounts, 'accounts');

        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);

          // Log wallet connection event
          logTransactionEvent('wallet_connected', {
            address: accounts[0],
            chainId: chainId,
          });
          toast({
            title: 'Wallet Connected',
            description: `Connected to Wallet: ${accounts[0].substring(
              0,
              10
            )}...`,
          });
        }
        setWeb3(web3Instance);
        setError(null);
        console.log('MetaKeep SDK initialized successfully');
      } catch (error) {
        console.error('Failed to initialize MetaKeep SDK:', error);
        setError('Failed to initialize wallet');

        // Log wallet initialization error
        logTransactionEvent('wallet_init_error', {
          error: (error as Error).message,
          chainId: transactionDetails?.chainId,
        });
      }
    };

    const setup = async () => {
      await initSDK();
    };

    setup();

    return () => {
      setResponse(null);
      setSignResponse(null);
      setError(null);
    };
  }, [transactionDetails]);

  const safeBigIntToJSON = (obj) => {
    return JSON.parse(
      JSON.stringify(obj, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );
  };
  const decodeReadResult = (web3, result, outputTypes) => {
    // if no output types were provided, simply return the raw result
    if (!outputTypes || outputTypes.length === 0) {
      return result;
    }
    try {
      if (outputTypes.length === 1) {
        // single value decode
        return web3.eth.abi.decodeParameter(outputTypes[0], result);
      } else {
        // multiple values decode
        return web3.eth.abi.decodeParameters(outputTypes, result);
      }
    } catch (error) {
      console.error('Decoding error:', error);
      throw error;
    }
  };
  const sendTransaction = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    // Log transaction execution start
    logTransactionEvent('transaction_execution_start', {
      to: transactionDetails?.functionInputs._to,
      value: transactionDetails?.functionInputs._value,
      chainId: transactionDetails?.chainId,
    });

    try {
      const readOnly = transactionDetails?.isReadOnly;
      const data = transactionDetails?.data;

      if (readOnly) {
        try {
          // For readonly functions, we just need to make an eth_call
          const result = await web3.eth.call({
            to: transactionDetails?.contractAddress,
            data: data,
          });

          console.log('Read function result:', result);

          // Format and set the response

          let decodedResult;
          if (
            transactionDetails.outputType &&
            transactionDetails.outputType.length > 0
          ) {
            // Use our utility function with the provided output types.
            decodedResult = decodeReadResult(
              web3,
              result,
              transactionDetails.outputType
            );
          } else {
            // Fallback: assume it's a string or use a default decoding
            decodedResult = web3.utils.hexToAscii(result);
          }

          console.log('Decoded result:', decodedResult);

          // Set the decoded result as the response (stringify objects if necessary)
          if (typeof decodedResult === 'object') {
            setResponse(JSON.stringify(decodedResult, null, 2));
          } else {
            setResponse(decodedResult);
          }

          toast({
            title: 'Read Operation Successful',
            description: 'Successfully read data from contract',
          });

          logTransactionEvent('read_function_success', {
            functionName: transactionDetails?.functionName,
            contractAddress: transactionDetails?.contractAddress,
            chainId: transactionDetails?.chainId,
          });
        } catch (error) {
          console.error('Error calling read function:', error);
          setError((error as Error).message);

          toast({
            title: 'Read Operation Failed',
            description: (error as Error).message,
            variant: 'destructive',
          });

          logTransactionEvent('read_function_error', {
            error: (error as Error).message,
            functionName: transactionDetails?.functionName,
            contractAddress: transactionDetails?.contractAddress,
            chainId: transactionDetails?.chainId,
          });
        }
      } else {
        // Handle regular transaction
        const web3Accounts = await metaKeep.getWallet();
        const to = transactionDetails?.functionInputs._to;
        const value = transactionDetails?.functionInputs._value ?? '';
        const gas = transactionDetails?.functionInputs.gas ?? 100000;
        const maxgas = transactionDetails?.functionInputs.maxgas ?? 1000000;
        const maxpriogas =
          transactionDetails?.functionInputs.maxpriogas ?? 100000;

        const nonceValue = await web3.eth.getTransactionCount(
          web3Accounts['wallet']['ethAddress'],
          'latest'
        );

        const txObj = {
          to,
          from: web3Accounts['wallet']['ethAddress'],
          value: web3.utils.toHex(value),
          nonce: web3.utils.toHex(nonceValue),
          data: data,
          gas: Number(gas),
          maxFeePerGas: Number(maxgas),
          maxPriorityFeePerGas: Number(maxpriogas),
          chainId: Number(transactionDetails?.chainId),
        };

        console.log('Transaction object:', txObj);

        const result = await metaKeep.signTransaction(
          txObj,
          `invoking the function ${transactionDetails?.functionName}`
        );

        const safeResult = safeBigIntToJSON(result);
        setSignResponse(JSON.stringify(safeResult, null, 2));

        logTransactionEvent('sign_success', {
          to,
          value,
          chainId: transactionDetails?.chainId,
          transactionHash: safeResult.transactionHash,
        });

        toast({
          title: 'Transaction signed',
          description: `Transaction hash: ${safeResult.transactionHash.substring(
            0,
            10
          )}...`,
        });

        const sendTx = await web3.eth.sendTransaction(
          txObj,
          web3Accounts['wallet']['ethAddress']
        );

        const safeSendTx = safeBigIntToJSON(sendTx);
        setResponse(JSON.stringify(safeSendTx, null, 2));

        if (!readOnly) {
          logTransactionEvent('transaction_success', {
            to: transactionDetails?.functionInputs._to,
            value: transactionDetails?.functionInputs._value,
            chainId: transactionDetails?.chainId,
            transactionHash: safeSendTx?.transactionHash,
          });

          toast({
            title: 'Transaction sent',
            description: `Transaction hash: ${safeSendTx?.transactionHash?.substring(
              0,
              10
            )}...`,
          });
        }
      }
    } catch (error) {
      console.error('Transaction error:', error.cause || error);

      setError(error.cause || 'Transaction failed');

      logTransactionEvent('transaction_error', {
        to: transactionDetails?.functionInputs._to,
        value: transactionDetails?.functionInputs._value,
        chainId: transactionDetails?.chainId,
        error: error?.cause || error,
      });

      toast({
        title: 'Transaction failed',
        description:
          error.cause || error.message || 'Failed to send transaction',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Send Transaction</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {walletAddress && (
          <div className="bg-secondary p-3 rounded-md text-sm break-all">
            <span className="font-medium">Connected:</span> {walletAddress}
          </div>
        )}

        {!transactionDetails?.isReadOnly && (
          <div className="space-y-2">
            <Label htmlFor="to-address">Recipient Address</Label>
            <Input
              id="to-address"
              placeholder="0x..."
              disabled
              value={transactionDetails.functionInputs._to}
            />
          </div>
        )}
        {!transactionDetails?.isReadOnly && (
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (in ETH/MATIC)</Label>
            <Input
              id="amount"
              disabled
              value={transactionDetails.functionInputs._value}
            />
          </div>
        )}

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {error}
          </div>
        )}
        {signResponse && (
          <>
            <div className="text-lg mx-auto my-2 text-blue-500 font-medium text-center">
              Sign Response Transaction Response
            </div>
            <div className="p-3 bg-secondary rounded-md text-xs font-mono overflow-auto max-h-40">
              {signResponse}
            </div>
          </>
        )}
        {response && (
          <>
            <div className="mx-auto my-2 text-lg text-blue-500 font-medium text-center">
              {transactionDetails?.isReadOnly
                ? 'Query Response'
                : 'Send Response'}
            </div>
            <div className="p-3 bg-secondary rounded-md text-xs font-mono overflow-auto max-h-40">
              {response}
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={sendTransaction}
          className="w-full"
          disabled={isLoading || !web3}
        >
          {isLoading
            ? 'Processing...'
            : transactionDetails?.isReadOnly
            ? 'Query Contract'
            : 'Send Transaction'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SimpleWallet;
