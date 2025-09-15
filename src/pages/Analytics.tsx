import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricCard } from "@/components/ui/metric-card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Eye, Users, MousePointer, DollarSign, Target, Mail, Share2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

// Mock data for demonstration
const trafficData = [
  { month: "Jan", visitors: 4000, conversions: 240, revenue: 2400 },
  { month: "Fev", visitors: 3000, conversions: 139, revenue: 2210 },
  { month: "Mar", visitors: 2000, conversions: 980, revenue: 2290 },
  { month: "Abr", visitors: 2780, conversions: 390, revenue: 2000 },
  { month: "Mai", visitors: 1890, conversions: 480, revenue: 2181 },
  { month: "Jun", visitors: 2390, conversions: 380, revenue: 2500 }
];

const channelData = [
  { name: "Orgânico", value: 45, color: "#8884d8" },
  { name: "PPC", value: 30, color: "#82ca9d" },
  { name: "Social Media", value: 15, color: "#ffc658" },
  { name: "Email", value: 10, color: "#ff7300" }
];

const campaignPerformance = [
  { name: "Campanha Q1", impressions: 15000, clicks: 1200, conversions: 85, spend: 3500 },
  { name: "Lançamento Produto", impressions: 8000, clicks: 950, conversions: 120, spend: 2800 },
  { name: "Black Friday", impressions: 25000, clicks: 2100, conversions: 340, spend: 5200 },
  { name: "Natal 2024", impressions: 12000, clicks: 890, conversions: 67, spend: 2100 }
];

export default function Analytics() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [dateRange, setDateRange] = useState("30d");

  useEffect(() => {
    fetchMetrics();
    fetchCampaigns();
  }, []);

  const fetchMetrics = async () => {
    const { data, error } = await supabase
      .from('metrics')
      .select('*')
      .order('date_recorded', { ascending: false });
    
    if (data) setMetrics(data);
  };

  const fetchCampaigns = async () => {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setCampaigns(data);
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

  return (
    <div className="space-y-8">
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
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Visitantes Únicos"
          value="24,580"
          change="+12.5%"
          trend="up"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title="Taxa de Conversão"
          value="3.2%"
          change="+0.8%"
          trend="up"
          icon={<Target className="h-4 w-4" />}
        />
        <MetricCard
          title="Receita Total"
          value="€45,231"
          change="-2.4%"
          trend="down"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCard
          title="ROAS Médio"
          value="4.2x"
          change="+15.3%"
          trend="up"
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
                  <LineChart data={trafficData}>
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
                  <p className="text-2xl font-bold">€{getTotalBudget().toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Gasto Atual</p>
                  <p className="text-2xl font-bold">€{getTotalSpent().toLocaleString()}</p>
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
              <CardDescription>Métricas detalhadas por campanha</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={campaignPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="impressions" fill="#8884d8" />
                  <Bar dataKey="clicks" fill="#82ca9d" />
                  <Bar dataKey="conversions" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
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
                        Orçamento: €{Number(campaign.budget || 0).toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">
                        Gasto: €{Number(campaign.spent || 0).toLocaleString()}
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
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Impressões</p>
                        <p className="font-semibold">12,450</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MousePointer className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Cliques</p>
                        <p className="font-semibold">1,234</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Conversões</p>
                        <p className="font-semibold">89</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">ROAS</p>
                        <p className="font-semibold">3.2x</p>
                      </div>
                    </div>
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
                    <p className="text-2xl font-bold">11,234</p>
                    <p className="text-sm text-green-600">+8.2%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Palavras-chave</p>
                    <p className="text-2xl font-bold">156</p>
                    <p className="text-sm text-green-600">+12</p>
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
                    <p className="text-2xl font-bold">2.8%</p>
                    <p className="text-sm text-green-600">+0.3%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CPC Médio</p>
                    <p className="text-2xl font-bold">€1.24</p>
                    <p className="text-sm text-red-600">+€0.12</p>
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
                    <p className="text-2xl font-bold">4.2%</p>
                    <p className="text-sm text-green-600">+0.8%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Alcance</p>
                    <p className="text-2xl font-bold">15.6k</p>
                    <p className="text-sm text-green-600">+2.1k</p>
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
                    <p className="text-2xl font-bold">28.4%</p>
                    <p className="text-sm text-green-600">+3.2%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa de Clique</p>
                    <p className="text-2xl font-bold">3.8%</p>
                    <p className="text-sm text-red-600">-0.4%</p>
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
              <CardDescription>Em breve: Dashboard completo de SEO com rankings, backlinks e análise técnica</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Social Media</CardTitle>
              <CardDescription>Em breve: Métricas detalhadas das redes sociais com engajamento e crescimento</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}