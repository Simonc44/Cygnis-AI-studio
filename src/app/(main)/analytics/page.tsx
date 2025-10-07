import { getAnalyticsData } from '@/lib/mock-data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  LineChart,
  DollarSign,
  Zap,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import {
  RequestVolumeChart,
  ResponseTimeChart,
} from './components/charts';

function formatNumber(num: number) {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toString();
}

export default async function AnalyticsPage() {
  const data = getAnalyticsData();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">
      <Card className="xl:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm font-medium">
            Total Requests <BarChart className="text-muted-foreground" />
          </CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-headline text-4xl font-bold">
            {formatNumber(data.kpis.totalRequests)}
          </p>
          <p className="text-xs text-muted-foreground">+20.1% from last month</p>
        </CardContent>
      </Card>
      <Card className="xl:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm font-medium">
            Avg. Response Time <Zap className="text-muted-foreground" />
          </CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-headline text-4xl font-bold">
            {data.kpis.avgResponseTime}s
          </p>
          <p className="text-xs text-muted-foreground">-10% from last month</p>
        </CardContent>
      </Card>
      <Card className="xl:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm font-medium">
            Error Rate <AlertTriangle className="text-muted-foreground" />
          </CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-headline text-4xl font-bold">
            {data.kpis.errorRate}%
          </p>
          <p className="text-xs text-muted-foreground">+0.2% from last month</p>
        </CardContent>
      </Card>
      <Card className="xl:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm font-medium">
            Est. Cost / Request <DollarSign className="text-muted-foreground" />
          </CardTitle>
          <CardDescription>Based on model usage</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-headline text-4xl font-bold">
            ${data.kpis.costPerRequest}
          </p>
          <p className="text-xs text-muted-foreground">vs $0.002 for others</p>
        </CardContent>
      </Card>

      <Card className="xl:col-span-4">
        <CardHeader>
          <CardTitle className="font-headline">Request Volume</CardTitle>
          <CardDescription>
            Comparison of daily requests over the last 30 days.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] w-full p-2">
          <RequestVolumeChart data={data.requestVolume} />
        </CardContent>
      </Card>

      <Card className="xl:col-span-4">
        <CardHeader>
          <CardTitle className="font-headline">
            Response Time Distribution
          </CardTitle>
          <CardDescription>
            Performance breakdown by response time buckets.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] w-full p-2">
          <ResponseTimeChart data={data.responseTimeDistribution} />
        </CardContent>
      </Card>
    </div>
  );
}
