import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DashboardFilters } from "@/components/DashboardFilters";
import { MetricCard } from "@/components/ui/metric-card";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  DollarSign, 
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState({
    startDate: '',
    endDate: '',
    campaignId: 'all'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch campaigns
      const { data: campaignsData } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id);
      setCampaigns(campaignsData || []);

      // Fetch metrics
      const { data: metricsData } = await supabase
        .from('metrics')
        .select('*')
        .eq('user_id', user.id);
      setMetrics(metricsData || []);

      // Fetch tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });
      setTasks(tasksData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // Calculate real metrics
  const getMetricValue = (metricName: string) => {
    return metrics
      .filter(m => m.metric_name === metricName)
      .reduce((sum, m) => sum + Number(m.metric_value || 0), 0);
  };

  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalBudget = campaigns.reduce((sum, c) => sum + Number(c.budget || 0), 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + Number(c.spent || 0), 0);
  const roi = totalSpent > 0 ? Math.round(((getMetricValue('revenue') - totalSpent) / totalSpent) * 100) : 0;

  // Calculate period-over-period changes (mock for now since we don't have historical data)
  const roiChange = 0; // Would calculate based on previous period data
  const budgetChange = 0; // Would calculate based on previous period data
  
  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setFilteredData(prev => ({ ...prev, startDate, endDate }));
    // Filter data based on date range
    toast({ title: "Filtros aplicados", description: `Período: ${startDate} - ${endDate}` });
  };

  const handleCampaignChange = (campaignId: string) => {
    setFilteredData(prev => ({ ...prev, campaignId }));
  };

  const generateExecutiveReport = () => {
    const reportHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório Executivo - Marketing</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
            .metric-card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; text-align: center; }
            .metric-value { font-size: 2em; font-weight: bold; color: #2563eb; }
            .metric-label { color: #666; margin-top: 5px; }
            .campaigns-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .campaigns-table th, .campaigns-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .campaigns-table th { background-color: #f5f5f5; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório Executivo de Marketing</h1>
            <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>
          
          <div class="metric-grid">
            <div class="metric-card">
              <div class="metric-value">${activeCampaigns}</div>
              <div class="metric-label">Campanhas Ativas</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">R$ ${totalBudget.toLocaleString('pt-BR')}</div>
              <div class="metric-label">Orçamento Total</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${roi}%</div>
              <div class="metric-label">ROI</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${getMetricValue('conversions')}</div>
              <div class="metric-label">Conversões</div>
            </div>
          </div>

          <h2>Campanhas Ativas</h2>
          <table class="campaigns-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Status</th>
                <th>Orçamento</th>
                <th>Gasto</th>
                <th>% Utilizado</th>
              </tr>
            </thead>
            <tbody>
              ${campaigns.map(campaign => `
                <tr>
                  <td>${campaign.name}</td>
                  <td>${campaign.status}</td>
                  <td>R$ ${(campaign.budget || 0).toLocaleString('pt-BR')}</td>
                  <td>R$ ${(campaign.spent || 0).toLocaleString('pt-BR')}</td>
                  <td>${campaign.budget ? Math.round((campaign.spent || 0) / campaign.budget * 100) : 0}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Relatório gerado automaticamente pelo FlowMint</p>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-executivo-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: "Relatório baixado!", description: "O relatório executivo foi salvo em HTML." });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do desempenho das suas campanhas de marketing
          </p>
        </div>
      </div>

      {/* Filters */}
      <DashboardFilters 
        onDateRangeChange={handleDateRangeChange}
        onCampaignChange={handleCampaignChange}
        campaigns={campaigns}
        onExportReport={generateExecutiveReport}
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Campanhas Ativas"
          value={activeCampaigns.toString()}
          change={0}
          trend={activeCampaigns > 0 ? "up" : "neutral"}
          icon={<Zap className="h-4 w-4" />}
        />
        <MetricCard
          title="Orçamento Total"
          value={`R$ ${totalBudget.toLocaleString('pt-BR')}`}
          change={0}
          trend="neutral"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCard
          title="ROI"
          value={`${roi}%`}
          change={0}
          trend={roi > 0 ? "up" : "neutral"}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          title="Conversões"
          value={getMetricValue('conversions').toString()}
          change={0}
          trend={getMetricValue('conversions') > 0 ? "up" : "neutral"}
          icon={<Target className="h-4 w-4" />}
        />
      </div>

      {/* Recent Campaigns and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle>Campanhas Recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {campaigns.slice(0, 5).map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{campaign.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                      {campaign.status}
                    </Badge>
                    <span>R$ {(campaign.spent || 0).toLocaleString('pt-BR')} / R$ {(campaign.budget || 0).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
                <Progress 
                  value={campaign.budget ? (campaign.spent || 0) / campaign.budget * 100 : 0} 
                  className="w-24" 
                />
              </div>
            ))}
            {campaigns.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma campanha encontrada</p>
                <p className="text-sm">Crie sua primeira campanha para começar.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Próximas Tarefas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximas Tarefas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString('pt-BR') : 'Sem prazo'}
                  </p>
                </div>
                <Badge variant="outline">
                  {task.status}
                </Badge>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma tarefa encontrada</p>
                <p className="text-sm">Crie tarefas para organizar seu trabalho.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}