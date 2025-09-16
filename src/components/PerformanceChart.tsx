import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

// Sample data structure - will be empty initially until real data is provided
const performanceData = [
  { month: 'Jan', impressions: 0, clicks: 0, conversions: 0, cost: 0 },
  { month: 'Fev', impressions: 0, clicks: 0, conversions: 0, cost: 0 },
  { month: 'Mar', impressions: 0, clicks: 0, conversions: 0, cost: 0 },
  { month: 'Abr', impressions: 0, clicks: 0, conversions: 0, cost: 0 },
  { month: 'Mai', impressions: 0, clicks: 0, conversions: 0, cost: 0 },
  { month: 'Jun', impressions: 0, clicks: 0, conversions: 0, cost: 0 },
];

const roiData = [
  { month: 'Jan', roi: 0, revenue: 0, cost: 0 },
  { month: 'Fev', roi: 0, revenue: 0, cost: 0 },
  { month: 'Mar', roi: 0, revenue: 0, cost: 0 },
  { month: 'Abr', roi: 0, revenue: 0, cost: 0 },
  { month: 'Mai', roi: 0, revenue: 0, cost: 0 },
  { month: 'Jun', roi: 0, revenue: 0, cost: 0 },
];

export function PerformanceChart() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="impressions" fill="hsl(var(--primary))" name="Impressões" />
              <Bar dataKey="clicks" fill="hsl(var(--secondary))" name="Cliques" />
              <Bar dataKey="conversions" fill="hsl(var(--accent))" name="Conversões" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ROI Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={roiData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="roi" stroke="hsl(var(--primary))" strokeWidth={2} name="ROI %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Custo vs Receita</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roiData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cost" fill="hsl(var(--destructive))" name="Custo" />
              <Bar dataKey="revenue" fill="hsl(var(--success))" name="Receita" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}