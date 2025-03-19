
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { decodeTransactionFromUrl, logTransactionEvent, logPageView } from '@/lib/metakeep';
import TransactionDetailsComponent from '@/components/TransactionDetails';
import { TransactionDetails as TransactionDetailsType } from '@/lib/types';
import Header from '@/components/Header';
import SimpleWallet from '@/components/SimpleWallet';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Transaction = () => {
  const { txData } = useParams<{ txData: string }>();
  const [transactionDetails, setTransactionDetails] = useState<TransactionDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Log page view for the transaction page
    logPageView('transaction_page');
    
    if (!txData) {
      setError('Transaction data not found in URL');
      setLoading(false);
      return;
    }

    // Check if the txData is the URL pattern parameter
    if (txData === ':txData') {
      setError('Invalid transaction URL. Please check your link.');
      setLoading(false);
      return;
    }

    try {
      const decoded = decodeTransactionFromUrl(txData);
      if (!decoded) {
        throw new Error('Unable to decode transaction data');
      }
      
      setTransactionDetails(decoded);
      
      // Log transaction page view with specific transaction details
      logTransactionEvent('transaction_page_view', {
        contractAddress: decoded.contractAddress,
        chainId: decoded.chainId,
        functionName: decoded.functionName,
        timestamp: new Date().toISOString()
      });
      
    } catch (err) {
      console.error('Error decoding transaction:', err);
      setError('Invalid transaction data. This link appears to be corrupted or malformed.');
      
      // Log error event
      logTransactionEvent('transaction_decode_error', {
        error: (err as Error).message,
        txData: txData
      });
      
      toast({
        title: "Error",
        description: "This transaction link appears to be invalid",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [txData]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container px-4 py-12 max-w-4xl">
        <Link to="/" className="flex items-center gap-1 text-primary hover:underline mb-6">
          <ArrowLeft size={16} />
          <span>Back to home</span>
        </Link>
        
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Transaction Details</h1>
          <p className="text-muted-foreground">
            Review and execute the transaction created for you
          </p>
        </div>
        
        {loading ? (
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <div className="space-y-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Loading Transaction</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
            
            <Card>
              <CardHeader>
                <CardTitle>Transaction Error</CardTitle>
                <CardDescription>
                  There was a problem with this transaction link
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">The transaction data could not be loaded. This may be due to one of the following reasons:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>The link was incorrectly copied</li>
                  <li>The link has expired</li>
                  <li>The transaction data is in an invalid format</li>
                </ul>
              </CardContent>
              <CardFooter className="flex gap-4">
                <Button asChild>
                  <Link to="/">Return Home</Link>
                </Button>
                <Button variant="outline" onClick={() => navigate(-1)}>
                  Go Back
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : transactionDetails && (
          <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
            <TransactionDetailsComponent transaction={transactionDetails} />
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Execute Transaction</h2>
              <SimpleWallet transactionDetails={transactionDetails} />
            </div>
          </div>
        )}
      </main>
      
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Built with MetaKeep embedded wallet technology</p>
      </footer>
    </div>
  );
};

export default Transaction;
