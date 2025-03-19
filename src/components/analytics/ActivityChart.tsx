
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface ActivityChartProps {
  data: { hour: string; count: number }[];
  isLoading?: boolean;
}

const ActivityChart = ({ data, isLoading = false }: ActivityChartProps) => {
  // Format data for display
  const formattedData = data.map(item => {
    // For time strings that are already formatted (like "3:00 PM")
    if (typeof item.hour === 'string' && 
        (item.hour.includes('AM') || item.hour.includes('PM') || 
         item.hour.includes(':') || /^\d{1,2}(:\d{2})?$/.test(item.hour))) {
      return {
        ...item,
        formattedHour: item.hour
      };
    }
    
    // For ISO date strings
    try {
      const date = new Date(item.hour);
      if (!isNaN(date.getTime())) {
        return {
          ...item,
          formattedHour: format(date, "h:mm a")
        };
      }
    } catch (e) {
      // Error parsing date, fall back to original value
    }
    
    // Default case, just use the original value
    return {
      ...item,
      formattedHour: item.hour
    };
  });

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Hourly Activity</CardTitle>
        <CardDescription>Events tracked by hour of day</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center">
              <Skeleton className="h-[250px] w-full" />
            </div>
          ) : formattedData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="formattedHour" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))'
                  }}
                  formatter={(value, name) => [value, 'Events']}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityChart;
