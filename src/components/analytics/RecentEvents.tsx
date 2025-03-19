
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface Event {
  id: number;
  event: string;
  timestamp: string;
  data: any;
}

interface RecentEventsProps {
  events: Event[];
  isLoading?: boolean;
}

const RecentEvents = ({ events, isLoading = false }: RecentEventsProps) => {
  // Format date string to a more readable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // If invalid date, return the original string
      }
      return format(date, "MMM d, yyyy h:mm a");
    } catch (e) {
      return dateString;
    }
  };

  // Determine if the event has a transaction link we can use
  const hasTransactionLink = (event: Event) => {
    return event.data && (
      event.data.txData || 
      (event.data.contractAddress && event.data.chainId && event.data.functionName)
    );
  };

  // Generate transaction link from event data
  const getTransactionLink = (event: Event) => {
    if (event.data.txData) {
      return `/transaction/${event.data.txData}`;
    }
    
    if (event.data.contractAddress && event.data.chainId && event.data.functionName) {
      const txData = {
        contractAddress: event.data.contractAddress,
        chainId: event.data.chainId,
        rpcUrl: event.data.rpcUrl || "https://ethereum.publicnode.com",
        functionName: event.data.functionName,
        functionInputs: event.data.functionInputs || {}
      };
      const encodedData = encodeURIComponent(btoa(JSON.stringify(txData)));
      return `/transaction/${encodedData}`;
    }
    
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Events</CardTitle>
        <CardDescription>Last 10 tracked events</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="p-3 border rounded-md">
                  <div className="flex justify-between items-start mb-1">
                    <Badge variant="outline" className="bg-primary/5">
                      {event.event.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(event.timestamp)}
                    </span>
                  </div>
                  <pre className="text-xs mt-2 bg-muted p-2 rounded overflow-x-auto">
                    {JSON.stringify(event.data, null, 2)}
                  </pre>
                  
                  {hasTransactionLink(event) && (
                    <div className="mt-2 flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild
                        className="text-xs"
                      >
                        <Link to={getTransactionLink(event)}>
                          View Transaction <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RecentEvents;
