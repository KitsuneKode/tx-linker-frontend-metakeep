import React, { useState, useEffect } from 'react';
import { getAnalyticsData, getPageLoads } from '@/lib/metakeep';
import Header from '@/components/Header';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import StatsCard from '@/components/analytics/StatsCard';
import ActivityChart from '@/components/analytics/ActivityChart';
import RecentEvents from '@/components/analytics/RecentEvents';

const Analytics: React.FC = () => {
  interface AnalyticsEvent {
    eventType: string;
    timeKey: string;
    displayTime: string;
    eventData: {
      chainId?: string;
      contractAddress?: string;
      functionName?: string;
      hash?: string;
      [key: string]: any;
    };
  }

  const [analytics, setAnalytics] = useState<AnalyticsEvent[]>([]);
  const [pageVisits, setPageVisits] = useState<
    { name: string; value: number }[]
  >([]);
  const [transactionStats, setTransactionStats] = useState<
    { name: string; value: number }[]
  >([]);
  interface HourlyData {
    hour: string;
    count: number;
  }

  const [hourlyActivity, setHourlyActivity] = useState<HourlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const analytics = await getAnalyticsData();
        setAnalytics(analytics);
        console.log('analytics', analytics);

        const pageLoadData = await getPageLoads();
        setPageVisits(pageLoadData.length);

        // Create a map to store combined hourly data
        const hourlyMap = new Map<string, { count: number }>();

        // Process page loads
        pageLoadData.forEach((item: any) => {
          try {
            const date = new Date(item.timeKey);
            const hour = !isNaN(date.getTime())
              ? date.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : item.displayTime || item.timeKey;

            if (!hourlyMap.has(hour)) {
              hourlyMap.set(hour, { count: 0 });
            }
            const current = hourlyMap.get(hour)!;
            hourlyMap.set(hour, { count: current.count + item.count });
          } catch (e) {
            console.error('Error processing page load data:', e);
          }
        });

        // Process analytics events
        const transactionEvents = analytics.filter((item) =>
          item.eventType.startsWith('event_transaction_')
        );

        transactionEvents.forEach((item) => {
          try {
            const date = new Date(item.timeKey);
            const hour = !isNaN(date.getTime())
              ? date.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : item.displayTime;

            if (!hourlyMap.has(hour)) {
              hourlyMap.set(hour, { count: 0 });
            }
            const current = hourlyMap.get(hour)!;
            hourlyMap.set(hour, { count: current.count + 1 });
          } catch (e) {
            console.error('Error processing transaction data:', e);
          }
        });

        // Convert map to array and sort by hour
        const hourlyData = Array.from(hourlyMap.entries())
          .map(([hour, data]) => ({
            hour,
            ...data,
          }))
          .sort((a, b) => a.hour.localeCompare(b.hour));

        setHourlyActivity(hourlyData);

        // Set mock data for transaction stats
        setTransactionStats([
          { name: 'success', value: 24 },
          { name: 'error', value: 3 },
          { name: 'pending', value: 2 },
        ]);
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
        // Set empty data in case of error
        setHourlyActivity([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Poll for updates every minute
    const intervalId = setInterval(fetchData, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const getRecentPageLoads = () => {
    // Return the latest entries from our hourly activity
    return hourlyActivity.slice(-10).map((item, index) => ({
      id: index,
      event: 'activity',
      timestamp: item.hour,
      data: { count: item.count },
    }));
  };

  const getRecentEvents = () => {
    return analytics.slice(-10).map((item, index) => ({
      id: index,
      event: item.eventType,
      timestamp: item.displayTime,
      data: item.eventData,
    }));
  };

  const getTransactionStats = () => {
    // Filter transactions from analytics data
    const txEvents = analytics.filter((item) => {
      return item.eventType.startsWith('event_transaction_');
    });

    console.log('All transaction events:', txEvents);

    // Count transaction states directly
    const success = txEvents.filter((tx) =>
      tx.eventType === 'event_transaction_success'
    ).length;

    const error = txEvents.filter((tx) =>
      tx.eventType === 'event_transaction_error'
    ).length;

    const pending = txEvents.filter((tx) =>
      tx.eventType === 'event_transaction_pending'
    ).length;

    console.log('Transaction counts:', { success, error, pending });

    return [
      { name: 'success', value: success },
      { name: 'error', value: error },
      { name: 'pending', value: pending },
    ];
  };

  const successRate = (() => {
    const stats = getTransactionStats();
    const success = stats.find((s) => s.name === 'success')?.value || 0;
    const error = stats.find((s) => s.name === 'error')?.value || 0;
    const total = success + error;
    return total > 0 ? Math.round((success / total) * 100) : 0;
  })();

  const activeChains = [1, 137, 80001]; // Mock data for now

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      <Header />

      <main className="flex-1 container px-4 py-8 max-w-6xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track transaction performance and user activity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Page Loads"
            value={hourlyActivity.reduce((sum, item) => sum + item.count, 0)}
            description="Total tracked page views"
            isLoading={isLoading}
          />
          <StatsCard
            title="Success Rate"
            value={`${successRate}%`}
            description="Transaction success rate"
            isLoading={isLoading}
          />
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Active Chains</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {activeChains.map((chainId, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-primary/10"
                  >
                    Chain ID: {chainId}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="events">Recent Events</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ActivityChart data={hourlyActivity} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <StatsCard
                title="Successful Transactions"
                value={
                  getTransactionStats().find((s) => s.name === 'success')
                    ?.value || 0
                }
                description="Total successful transactions"
                isLoading={isLoading}
              />
              <StatsCard
                title="Failed Transactions"
                value={
                  getTransactionStats().find((s) => s.name === 'error')
                    ?.value || 0
                }
                description="Total failed transactions"
                isLoading={isLoading}
              />
              <StatsCard
                title="Pending Transactions"
                value={
                  getTransactionStats().find((s) => s.name === 'pending')
                    ?.value || 0
                }
                description="Currently pending transactions"
                isLoading={isLoading}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  All transaction events in chronological order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <th className="h-12 px-4 text-left align-middle font-medium">
                            Status
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium">
                            Time
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium">
                            Chain ID
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium">
                            Contract
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium">
                            Function
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium">
                            Hash
                          </th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {analytics
                          .filter((item) =>
                            item.eventType.startsWith('event_transaction_')
                          )
                          .map((item, index) => (
                            <tr
                              key={index}
                              className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                            >
                              <td className="p-4 align-middle">
                                <Badge
                                  variant={
                                    item.eventType.includes('success')
                                      ? 'default'
                                      : item.eventType.includes('error')
                                      ? 'destructive'
                                      : 'secondary'
                                  }
                                >
                                  {item.eventType.replace(
                                    'event_transaction_',
                                    ''
                                  )}
                                </Badge>
                              </td>
                              <td className="p-4 align-middle">
                                {item.displayTime}
                              </td>
                              <td className="p-4 align-middle">
                                {item.eventData?.chainId || '-'}
                              </td>
                              <td className="p-4 align-middle">
                                <span className="font-mono text-xs">
                                  {item.eventData?.contractAddress
                                    ? `${item.eventData.contractAddress.substring(
                                        0,
                                        6
                                      )}...${item.eventData.contractAddress.substring(
                                        38
                                      )}`
                                    : '-'}
                                </span>
                              </td>
                              <td className="p-4 align-middle">
                                {item.eventData?.functionName || '-'}
                              </td>
                              <td className="p-4 align-middle">
                                <span className="font-mono text-xs">
                                  {item.eventData?.hash
                                    ? `${item.eventData.hash.substring(
                                        0,
                                        6
                                      )}...${item.eventData.hash.substring(62)}`
                                    : '-'}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Events</CardTitle>
                  <CardDescription>
                    Latest events from the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentEvents
                    events={getRecentEvents()}
                    isLoading={isLoading}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Page Loads</CardTitle>
                  <CardDescription>Recent page load events</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentEvents
                    events={getRecentPageLoads()}
                    isLoading={isLoading}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>TransactLinker Analytics Dashboard</p>
      </footer>
    </div>
  );
};

export default Analytics;
