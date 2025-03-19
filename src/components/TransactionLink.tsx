
import React, { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Copy } from 'lucide-react';
import { logTransactionEvent } from '@/lib/metakeep';

interface TransactionLinkProps {
  link: string;
}

const TransactionLink: React.FC<TransactionLinkProps> = ({ link }) => {
  const [copying, setCopying] = useState(false);

  const copyToClipboard = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(link);
      
      // Log the link copy event
      logTransactionEvent('transaction_link_copied', {
        link: link,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Link copied!",
        description: "Transaction link copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually",
        variant: "destructive",
      });
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="w-full glass-panel p-6 space-y-4 animate-slide-up">
      <h3 className="text-lg font-medium">Your Transaction Link</h3>
      
      <div className="relative">
        <div className="bg-secondary p-4 rounded-lg break-all font-mono text-sm">
          {link}
        </div>
        
        <Button 
          onClick={copyToClipboard}
          disabled={copying}
          className="absolute top-2 right-2 h-8 w-8 p-0"
          variant="ghost"
          aria-label="Copy link"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Share this link with users who need to sign this transaction
        </p>
        
        <Button 
          onClick={copyToClipboard}
          disabled={copying}
          className="transition-all duration-300"
        >
          Copy Link
        </Button>
      </div>
    </div>
  );
};

export default TransactionLink;
