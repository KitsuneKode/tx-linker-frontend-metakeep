
import React, { useState, useEffect } from 'react';
import { getAnalyticsData } from '@/lib/metakeep';
import Header from '@/components/Header';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import StatsCard from '@/components/analytics/StatsCard';
import ActivityChart from '@/components/analytics/ActivityChart';
import RecentEvents from '@/components/analytics/RecentEvents';

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [pageVisits, setPageVisits] = useState<{ name: string; value: number }[]>([]);
  const [transactionStats, setTransactionStats] = useState<{ name: string; value: number }[]>([]);
  const [hourlyActivity, setHourlyActivity] = useState<{ hour: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getAnalyticsData();
        setAnalytics(data);
        
        // Convert the data into the expected format for charts with better time formatting
        const hourlyData = data.map((item: any) => {
          try {
            const date = new Date(item.timeKey);
            return {
              hour: !isNaN(date.getTime()) 
                ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : item.displayTime || item.timeKey,
              count: item.count
            };
          } catch (e) {
            // If date parsing fails, use the display time or original timeKey
            return {
              hour: item.displayTime || item.timeKey,
              count: item.count
            };
          }
        });
        
        setHourlyActivity(hourlyData);
        
        // Set mock data for transaction stats
        setTransactionStats([
          { name: 'success', value: 24 },
          { name: 'error', value: 3 },
          { name: 'pending', value: 2 }
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
  
  const getRecentEvents = () => {
    // Return the latest entries from our hourly activity
    return hourlyActivity.slice(-10).map((item, index) => ({
      id: index,
      event: 'page_load',
      timestamp: item.hour,
      data: { count: item.count }
    }));
  };

  const successRate = transactionStats.length > 0
    ? Math.round((transactionStats.find(s => s.name === 'success')?.value || 0) /
      ((transactionStats.find(s => s.name === 'success')?.value || 0) +
       (transactionStats.find(s => s.name === 'error')?.value || 0)) * 100)
    : 0;

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
                  <Badge key={index} variant="outline" className="bg-primary/10">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StatsCard 
                title="Successful Transactions" 
                value={transactionStats.find(s => s.name === 'success')?.value || 0}
                isLoading={isLoading}
              />
              <StatsCard 
                title="Failed Transactions" 
                value={transactionStats.find(s => s.name === 'error')?.value || 0}
                isLoading={isLoading}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="events">
            <RecentEvents events={getRecentEvents()} isLoading={isLoading} />
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
