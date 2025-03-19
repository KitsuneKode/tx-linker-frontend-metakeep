import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  parseABI,
  getContractFunctions,
  createShareableLink,
} from '@/lib/metakeep';
import {
  ContractFunction,
  ChainOption,
  SUPPORTED_CHAINS,
  TransactionDetails,
} from '@/lib/types';
import TransactionLink from '@/components/TransactionLink';
import { toast } from '@/hooks/use-toast';

const DeveloperForm: React.FC = () => {
  const [abi, setAbi] = useState('');
  const [value, setValue] = useState(0);
  const [gas, setGas] = useState(0);
  const [maxGas, setMaxGas] = useState(0);
  const [maxPrioGas, setMaxPrioGas] = useState(0);
  const [contractAddress, setContractAddress] = useState('');
  const [customRpcUrl, setCustomRpcUrl] = useState('');
  const [selectedChainId, setSelectedChainId] = useState<number>(1);
  const [contractFunctions, setContractFunctions] = useState<
    ContractFunction[]
  >([]);
  const [selectedFunction, setSelectedFunction] =
    useState<ContractFunction | null>(null);
  const [functionInputs, setFunctionInputs] = useState<{
    [key: string]: string;
  }>({});
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [abiError, setAbiError] = useState<string | null>(null);

  // Reset function inputs when selected function changes
  useEffect(() => {
    setFunctionInputs({});
  }, [selectedFunction]);

  // Get RPC URL for the selected chain
  const getRpcUrl = () => {
    if (customRpcUrl) return customRpcUrl;
    const selectedChain = SUPPORTED_CHAINS.find(
      (chain) => chain.id === selectedChainId
    );
    return selectedChain?.rpcUrl || '';
  };

  // Parse ABI and extract contract functions
  const handleParseAbi = () => {
    try {
      const parsedABI = parseABI(abi);
      if (!parsedABI) {
        setAbiError('Invalid ABI format');
        return;
      }

      const functions = getContractFunctions(parsedABI);
      setContractFunctions(functions);
      setAbiError(null);

      if (functions.length === 0) {
        toast({
          title: 'No functions found',
          description: "The provided ABI doesn't contain any functions",
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'ABI parsed successfully',
          description: `Found ${functions.length} functions in the contract`,
        });
      }
    } catch (error) {
      setAbiError('Failed to parse ABI');
      setContractFunctions([]);
    }
  };

  // Handle input change for function parameters
  const handleInputChange = (paramName: string, value: string) => {
    setFunctionInputs((prev) => ({
      ...prev,
      [paramName]: value,
    }));
  };

  // Generate shareable link
  const handleGenerateLink = () => {
    setLoading(true);

    try {
      if (!contractAddress) {
        throw new Error('Contract address is required');
      }

      if (!selectedFunction) {
        throw new Error('Select a function to execute');
      }

      // Check if all required inputs are provided
      selectedFunction.inputs.forEach((input) => {
        if (!functionInputs[input.name] && functionInputs[input.name] !== '') {
          throw new Error(`Parameter "${input.name}" is required`);
        }
      });

      const transactionDetails: TransactionDetails = {
        contractAddress,
        chainId: selectedChainId,
        rpcUrl: getRpcUrl(),
        functionName: selectedFunction.name,
        functionInputs,
      };

      const link = createShareableLink(transactionDetails);
      setGeneratedLink(link);

      toast({
        title: 'Link generated',
        description: 'Transaction link created successfully',
      });
    } catch (error) {
      toast({
        title: 'Failed to generate link',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <Card className="shadow-md border-0 shadow-black/5 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
          <CardTitle className="text-2xl font-semibold">
            Create Transaction Link
          </CardTitle>
          <CardDescription>
            Generate a shareable link for any blockchain transaction
          </CardDescription>
        </CardHeader>

        <Tabs defaultValue="contract">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="contract">Contract Details</TabsTrigger>
            <TabsTrigger
              value="function"
              disabled={contractFunctions.length === 0}
            >
              Function Parameters
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contract" className="animate-slide-up">
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="contract-address">Contract Address</Label>
                <Input
                  id="contract-address"
                  placeholder="0x..."
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chain-select">Blockchain Network</Label>
                <Select
                  value={selectedChainId.toString()}
                  onValueChange={(value) => setSelectedChainId(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a network" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_CHAINS.map((chain) => (
                      <SelectItem key={chain.id} value={chain.id.toString()}>
                        {chain.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-rpc">Custom RPC URL (Optional)</Label>
                <Input
                  id="custom-rpc"
                  placeholder="https://..."
                  value={customRpcUrl}
                  onChange={(e) => setCustomRpcUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to use default RPC URL for the selected network
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="contract-abi">Contract ABI</Label>
                  {abiError && (
                    <span className="text-xs text-destructive">{abiError}</span>
                  )}
                </div>
                <Textarea
                  id="contract-abi"
                  placeholder='[{"inputs":[],"name":"function","outputs":[],"stateMutability":"nonpayable","type":"function"}]'
                  className="min-h-[150px] font-mono text-sm"
                  value={abi}
                  onChange={(e) => setAbi(e.target.value)}
                />
              </div>
            </CardContent>

            <CardFooter>
              <Button
                onClick={handleParseAbi}
                className="w-full transition-all duration-300 hover:shadow-md"
                disabled={!abi}
              >
                Parse ABI & Continue
              </Button>
            </CardFooter>
          </TabsContent>

          <TabsContent value="function" className="animate-slide-up">
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="function-select">Select Function</Label>
                <Select
                  value={selectedFunction?.name || ''}
                  onValueChange={(value) => {
                    const func =
                      contractFunctions.find((f) => f.name === value) || null;
                    setSelectedFunction(func);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a function" />
                  </SelectTrigger>
                  <SelectContent>
                    {contractFunctions.map((func, index) => (
                      <SelectItem key={index} value={func.name}>
                        {func.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedFunction && (
                <div className="space-y-4">
                  <div className="p-3 bg-secondary/50 rounded-md">
                    <p className="text-sm font-medium">Function Signature</p>
                    <p className="text-sm font-mono">
                      {selectedFunction.name}(
                      {selectedFunction.inputs
                        .map((input) => `${input.type} ${input.name}`)
                        .join(', ')}
                      )
                      {selectedFunction.outputs.length > 0
                        ? `returns (${selectedFunction.outputs
                            .map((output) => `${output.type} ${output.name}`)
                            .join(', ')})`
                        : ''}
                    </p>
                  </div>

                  {selectedFunction.inputs.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Function Parameters</p>
                      {selectedFunction.inputs.map((input, index) => (
                        <div key={index} className="space-y-1">
                          <Label htmlFor={input.name}>
                            {input.name || `param${index}`} ({input.type})
                          </Label>
                          <Input
                            id={input.name}
                            placeholder={`Enter ${input.type} value`}
                            value={functionInputs[input.name] || ''}
                            onChange={(e) =>
                              handleInputChange(input.name, e.target.value)
                            }
                          />
                        </div>
                      ))}
                      <div key="gas" className="space-y-1">
                        <Label htmlFor="gas">gas</Label>
                        <Input
                          id="gas"
                          placeholder={`Enter gas value`}
                          value={functionInputs['gas']}
                          onChange={(e) =>
                            handleInputChange('gas', e.target.value)
                          }
                        />
                      </div>{' '}
                      <div key="maxgas" className="space-y-1">
                        <Label htmlFor="maxgas">MaxFeePerGas</Label>
                        <Input
                          id="maxgas"
                          placeholder={`Enter maxfeepergas value`}
                          value={functionInputs['maxgas']}
                          onChange={(e) =>
                            handleInputChange('maxgas', e.target.value)
                          }
                        />
                      </div>{' '}
                      <div key="maxpriogas" className="space-y-1">
                        <Label htmlFor="maxpriogas">MaxPriorityFeePerGas</Label>
                        <Input
                          id="maxpriogas"
                          placeholder={`Enter MaxPriorityFeePerGas value`}
                          value={functionInputs['maxpriogas'] || ''}
                          onChange={(e) =>
                            handleInputChange('maxpriogas', e.target.value)
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      This function doesn't require any parameters
                    </p>
                  )}
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button
                onClick={handleGenerateLink}
                className="w-full transition-all duration-300 hover:shadow-md"
                disabled={!selectedFunction || loading}
              >
                {loading ? 'Generating...' : 'Generate Transaction Link'}
              </Button>
            </CardFooter>
          </TabsContent>
        </Tabs>
      </Card>

      {generatedLink && (
        <div className="mt-6">
          <TransactionLink link={generatedLink} />
        </div>
      )}
    </div>
  );
};

export default DeveloperForm;
