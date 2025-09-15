import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricCard } from "@/components/ui/metric-card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Eye, Users, MousePointer, DollarSign, Target, Mail, Share2, Search, CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Metric {
  id: string;
  campaign_id: string;
  channel: string;
  metric_name: string;
  metric_value: number;
  date_recorded: string;
}

interface Campaign {
  id: string;
  name: string;
  budget: number;
  spent: number;
  status: string;
}

// Default channel data for visualization
const channelData = [
  { name: "Orgânico", value: 45, color: "#8884d8" },
  { name: "PPC", value: 30, color: "#82ca9d" },
  { name: "Social Media", value: 15, color: "#ffc658" },
  { name: "Email", value: 10, color: "#ff7300" }
];

export default function Analytics() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [dateRange, setDateRange] = useState("30d");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [filteredMetrics, setFilteredMetrics] = useState<Metric[]>([]);

  useEffect(() => {
    fetchMetrics();
    fetchCampaigns();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [metrics, selectedCampaign, dateRange, startDate, endDate]);

  const fetchMetrics = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMetrics([]); return; }
    const { data } = await supabase
      .from('metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('date_recorded', { ascending: false });
    if (data) setMetrics(data);
  };

  const fetchCampaigns = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setCampaigns([]); return; }
    const { data } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setCampaigns(data);
  };

  const applyFilters = () => {
    let filtered = [...metrics];

    // Filtrar por campanha
    if (selectedCampaign !== "all") {
      filtered = filtered.filter(m => m.campaign_id === selectedCampaign);
    }

    // Filtrar por data
    if (startDate || endDate) {
      filtered = filtered.filter(m => {
        const metricDate = new Date(m.date_recorded);
        if (startDate && metricDate < startDate) return false;
        if (endDate && metricDate > endDate) return false;
        return true;
      });
    } else if (dateRange !== "all") {
      const days = parseInt(dateRange.replace('d', ''));
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      filtered = filtered.filter(m => new Date(m.date_recorded) >= cutoffDate);
    }

    setFilteredMetrics(filtered);
  };

  const getTotalBudget = () => {
    return campaigns.reduce((sum, campaign) => sum + Number(campaign.budget || 0), 0);
  };

  const getTotalSpent = () => {
    return campaigns.reduce((sum, campaign) => sum + Number(campaign.spent || 0), 0);
  };

  const getBudgetUtilization = () => {
    const total = getTotalBudget();
    const spent = getTotalSpent();
    return total > 0 ? Math.round((spent / total) * 100) : 0;
  };

  // Usar métricas filtradas
  const sumBy = (names: string[]) => filteredMetrics.filter(m => names.includes(m.metric_name)).reduce((s, m) => s + Number(m.metric_value || 0), 0);
  const totalVisitors = sumBy(['traffic', 'visitors', 'unique_visitors']);
  const totalConversions = sumBy(['conversions']);
  const totalRevenue = sumBy(['revenue']);
  const conversionRate = totalVisitors > 0 ? Number(((totalConversions / totalVisitors) * 100).toFixed(1)) : 0;
  const roas = getTotalSpent() > 0 ? Number((totalRevenue / getTotalSpent()).toFixed(1)) : 0;

  // Gerar dados de gráfico baseados nos dados reais
  const generateChartData = () => {
    const monthlyData = filteredMetrics.reduce((acc: any, metric) => {
      const month = format(new Date(metric.date_recorded), 'MMM');
      if (!acc[month]) acc[month] = { month, visitors: 0, conversions: 0, revenue: 0 };
      
      if (['traffic', 'visitors', 'unique_visitors'].includes(metric.metric_name)) {
        acc[month].visitors += Number(metric.metric_value || 0);
      } else if (metric.metric_name === 'conversions') {
        acc[month].conversions += Number(metric.metric_value || 0);
      } else if (metric.metric_name === 'revenue') {
        acc[month].revenue += Number(metric.metric_value || 0);
      }
      
      return acc;
    }, {});
    
    return Object.values(monthlyData);
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Acompanhe o desempenho das suas campanhas e métricas</p>
        </div>
        <div className="flex gap-2">
          <select 
            className="px-3 py-2 border rounded-md"
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
          >
            <option value="all">Todas as Campanhas</option>
            {campaigns.map(campaign => (
              <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
            ))}
          </select>
          <select 
            className="px-3 py-2 border rounded-md"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "dd/MM/yyyy") : "Data início"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus className="pointer-events-auto" />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "dd/MM/yyyy") : "Data fim"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus className="pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Visitantes"
          value={totalVisitors.toLocaleString('pt-BR')}
          change={undefined}
          trend={undefined}
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title="Taxa de Conversão"
          value={`${conversionRate}%`}
          change={undefined}
          trend={undefined}
          icon={<Target className="h-4 w-4" />}
        />
        <MetricCard
          title="Receita Total"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue || 0)}
          change={undefined}
          trend={undefined}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCard
          title="ROAS Médio"
          value={`${roas}x`}
          change={undefined}
          trend={undefined}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="channels">Canais</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tráfego e Conversões</CardTitle>
                <CardDescription>Evolução mensal dos principais indicadores</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={generateChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="visitors" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="conversions" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Canal</CardTitle>
                <CardDescription>Origem do tráfego por canal de marketing</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Orçamento e Gastos</CardTitle>
              <CardDescription>Controle orçamental das campanhas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Orçamento Total</p>
                  <p className="text-2xl font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getTotalBudget())}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Gasto Atual</p>
                  <p className="text-2xl font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getTotalSpent())}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Utilização</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{getBudgetUtilization()}%</p>
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${getBudgetUtilization()}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance das Campanhas</CardTitle>
              <CardDescription>Métricas detalhadas por campanha ativas</CardDescription>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <p>Nenhuma campanha criada ainda</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map(campaign => {
                    const campaignMetrics = filteredMetrics.filter(m => m.campaign_id === campaign.id);
                    const impressions = campaignMetrics.filter(m => m.metric_name === 'impressions').reduce((s, m) => s + Number(m.metric_value || 0), 0);
                    const clicks = campaignMetrics.filter(m => m.metric_name === 'clicks').reduce((s, m) => s + Number(m.metric_value || 0), 0);
                    const conversions = campaignMetrics.filter(m => m.metric_name === 'conversions').reduce((s, m) => s + Number(m.metric_value || 0), 0);
                    
                    return (
                      <div key={campaign.id} className="p-4 border rounded-lg">
                        <h4 className="font-semibold">{campaign.name}</h4>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          <div><span className="text-muted-foreground">Impressões:</span> {impressions}</div>
                          <div><span className="text-muted-foreground">Cliques:</span> {clicks}</div>
                          <div><span className="text-muted-foreground">Conversões:</span> {conversions}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {campaigns.map(campaign => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Orçamento: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(campaign.budget || 0))}
                      </span>
                      <span className="text-muted-foreground">
                        Gasto: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(campaign.spent || 0))}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.status === 'active' ? 'Ativa' : 'Pausada'}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    {(() => {
                      const campaignMetrics = filteredMetrics.filter(m => m.campaign_id === campaign.id);
                      const impressions = campaignMetrics.filter(m => m.metric_name === 'impressions').reduce((s, m) => s + Number(m.metric_value || 0), 0);
                      const clicks = campaignMetrics.filter(m => m.metric_name === 'clicks').reduce((s, m) => s + Number(m.metric_value || 0), 0);
                      const conversions = campaignMetrics.filter(m => m.metric_name === 'conversions').reduce((s, m) => s + Number(m.metric_value || 0), 0);
                      const revenue = campaignMetrics.filter(m => m.metric_name === 'revenue').reduce((s, m) => s + Number(m.metric_value || 0), 0);
                      const roas = campaign.spent && campaign.spent > 0 ? (revenue / campaign.spent).toFixed(1) : '0.0';
                      
                      return (
                        <>
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Impressões</p>
                              <p className="font-semibold">{impressions.toLocaleString('pt-BR')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <MousePointer className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Cliques</p>
                              <p className="font-semibold">{clicks.toLocaleString('pt-BR')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Conversões</p>
                              <p className="font-semibold">{conversions.toLocaleString('pt-BR')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">ROAS</p>
                              <p className="font-semibold">{roas}x</p>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="channels">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  SEO & Orgânico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tráfego Orgânico</p>
                    <p className="text-2xl font-bold">{filteredMetrics.filter(m => m.metric_name === 'organic_traffic').reduce((s, m) => s + Number(m.metric_value || 0), 0).toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Palavras-chave</p>
                    <p className="text-2xl font-bold">{filteredMetrics.filter(m => m.metric_name === 'keywords').reduce((s, m) => s + Number(m.metric_value || 0), 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointer className="h-5 w-5" />
                  PPC & Anúncios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">CTR Médio</p>
                    <p className="text-2xl font-bold">{(() => {
                      const clicks = filteredMetrics.filter(m => m.metric_name === 'clicks').reduce((s, m) => s + Number(m.metric_value || 0), 0);
                      const impressions = filteredMetrics.filter(m => m.metric_name === 'impressions').reduce((s, m) => s + Number(m.metric_value || 0), 0);
                      return impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : '0.0';
                    })()}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CPC Médio</p>
                    <p className="text-2xl font-bold">R$ {(() => {
                      const spent = getTotalSpent();
                      const clicks = filteredMetrics.filter(m => m.metric_name === 'clicks').reduce((s, m) => s + Number(m.metric_value || 0), 0);
                      return clicks > 0 ? (spent / clicks).toFixed(2) : '0.00';
                    })()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Redes Sociais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Engajamento</p>
                    <p className="text-2xl font-bold">{filteredMetrics.filter(m => m.metric_name === 'engagement').reduce((s, m) => s + Number(m.metric_value || 0), 0).toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Alcance</p>
                    <p className="text-2xl font-bold">{(filteredMetrics.filter(m => m.metric_name === 'reach').reduce((s, m) => s + Number(m.metric_value || 0), 0) / 1000).toFixed(1)}k</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Marketing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa de Abertura</p>
                    <p className="text-2xl font-bold">{(() => {
                      const opens = filteredMetrics.filter(m => m.metric_name === 'email_opens').reduce((s, m) => s + Number(m.metric_value || 0), 0);
                      const sent = filteredMetrics.filter(m => m.metric_name === 'email_sent').reduce((s, m) => s + Number(m.metric_value || 0), 0);
                      return sent > 0 ? ((opens / sent) * 100).toFixed(1) : '0.0';
                    })()}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa de Clique</p>
                    <p className="text-2xl font-bold">{(() => {
                      const emailClicks = filteredMetrics.filter(m => m.metric_name === 'email_clicks').reduce((s, m) => s + Number(m.metric_value || 0), 0);
                      const sent = filteredMetrics.filter(m => m.metric_name === 'email_sent').reduce((s, m) => s + Number(m.metric_value || 0), 0);
                      return sent > 0 ? ((emailClicks / sent) * 100).toFixed(1) : '0.0';
                    })()}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>Métricas de SEO</CardTitle>
              <CardDescription>Dashboard completo de SEO com base nos dados reais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Tráfego Orgânico</p>
                  <p className="text-2xl font-bold">{filteredMetrics.filter(m => m.metric_name === 'organic_traffic').reduce((s, m) => s + Number(m.metric_value || 0), 0).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Palavras-chave Rankeadas</p>
                  <p className="text-2xl font-bold">{filteredMetrics.filter(m => m.metric_name === 'keywords').reduce((s, m) => s + Number(m.metric_value || 0), 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Backlinks</p>
                  <p className="text-2xl font-bold">{filteredMetrics.filter(m => m.metric_name === 'backlinks').reduce((s, m) => s + Number(m.metric_value || 0), 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Social Media</CardTitle>
              <CardDescription>Métricas detalhadas das redes sociais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Engajamento Total</p>
                  <p className="text-2xl font-bold">{filteredMetrics.filter(m => m.metric_name === 'engagement').reduce((s, m) => s + Number(m.metric_value || 0), 0).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Alcance</p>
                  <p className="text-2xl font-bold">{(filteredMetrics.filter(m => m.metric_name === 'reach').reduce((s, m) => s + Number(m.metric_value || 0), 0) / 1000).toFixed(1)}k</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Seguidores</p>
                  <p className="text-2xl font-bold">{filteredMetrics.filter(m => m.metric_name === 'followers').reduce((s, m) => s + Number(m.metric_value || 0), 0).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}