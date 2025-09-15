import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap,
  Plus,
  Calendar,
  Target,
  TrendingUp,
  Eye,
  Users,
  DollarSign,
  Play,
  Pause,
  Settings,
  BarChart3
} from "lucide-react";
import { CampaignModal } from "@/components/CampaignModal";

const mockCampaigns = [
  {
    id: 1,
    name: "Lançamento Produto X - Q4",
    status: "active",
    persona: "Fundador de Startup",
    budget: 20000,
    spent: 12340,
    startDate: "2024-10-01",
    endDate: "2024-12-31",
    objectives: ["Aumentar Geração de Leads em 25%", "Lançar Campanha Produto X"],
    channels: ["Google Ads", "LinkedIn", "Content Marketing"],
    metrics: {
      impressions: 245000,
      clicks: 12400,
      conversions: 342,
      roi: 180
    }
  },
  {
    id: 2,
    name: "Campanha Retenção Clientes",
    status: "warning",
    persona: "Cliente Existente",
    budget: 8500,
    spent: 7890,
    startDate: "2024-09-15",
    endDate: "2024-11-15",
    objectives: ["Melhorar Taxa de Conversão em 15%"],
    channels: ["Email Marketing", "Retargeting"],
    metrics: {
      impressions: 89000,
      clicks: 5600,
      conversions: 89,
      roi: 95
    }
  },
  {
    id: 3,
    name: "SEO & Content Marketing",
    status: "active",
    persona: "Múltiplas",
    budget: 15000,
    spent: 9200,
    startDate: "2024-08-01",
    endDate: "2024-12-31",
    objectives: ["Aumentar Geração de Leads em 25%"],
    channels: ["SEO", "Blog", "Social Media"],
    metrics: {
      impressions: 156000,
      clicks: 8900,
      conversions: 267,
      roi: 220
    }
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "text-success border-success";
    case "warning":
      return "text-warning border-warning";
    case "paused":
      return "text-muted-foreground border-muted-foreground";
    default:
      return "text-muted-foreground border-muted-foreground";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "active":
      return "Ativa";
    case "warning":
      return "Em Risco";
    case "paused":
      return "Pausada";
    default:
      return "Rascunho";
  }
};

export default function Campaigns() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showCampaignModal, setShowCampaignModal] = useState(false);

  const handleCampaignCreated = () => {
    // Refresh campaigns list
    window.location.reload();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campanhas</h1>
          <p className="text-muted-foreground">
            Gerencie e monitore suas campanhas de marketing integradas
          </p>
        </div>
        <Button 
          className="gap-2 gradient-primary"
          onClick={() => setShowCampaignModal(true)}
        >
          <Plus className="w-4 h-4" />
          Nova Campanha
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Desempenho</TabsTrigger>
          <TabsTrigger value="planning">Planeamento</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Campanhas Ativas</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-secondary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Orçamento Total</p>
                    <p className="text-2xl font-bold">€43.5K</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-success" />
                  <div>
                    <p className="text-sm text-muted-foreground">ROI Médio</p>
                    <p className="text-2xl font-bold">165%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">Conversões</p>
                    <p className="text-2xl font-bold">698</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Campaigns List */}
          <div className="space-y-4">
            {mockCampaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {campaign.name}
                          <Badge variant="outline" className={getStatusColor(campaign.status)}>
                            {getStatusText(campaign.status)}
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Persona: {campaign.persona} • 
                          {campaign.channels.join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        {campaign.status === "active" ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Budget Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Orçamento Utilizado</span>
                      <span>€{campaign.spent.toLocaleString()} / €{campaign.budget.toLocaleString()}</span>
                    </div>
                    <Progress value={(campaign.spent / campaign.budget) * 100} className="h-2" />
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Impressões</p>
                      <p className="text-xl font-semibold">{campaign.metrics.impressions.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Cliques</p>
                      <p className="text-xl font-semibold">{campaign.metrics.clicks.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Conversões</p>
                      <p className="text-xl font-semibold">{campaign.metrics.conversions}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">ROI</p>
                      <p className="text-xl font-semibold text-success">{campaign.metrics.roi}%</p>
                    </div>
                  </div>

                  {/* Objectives */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Objetivos Vinculados
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {campaign.objectives.map((objective, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {objective}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Início: {new Date(campaign.startDate).toLocaleDateString('pt-PT')}</span>
                    </div>
                    <span>•</span>
                    <span>Fim: {new Date(campaign.endDate).toLocaleDateString('pt-PT')}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Desempenho</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4" />
                  <p>Gráficos de desempenho em desenvolvimento</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Planeamento de Campanhas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4" />
                  <p>Ferramentas de planeamento em desenvolvimento</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CampaignModal 
        isOpen={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        onSuccess={handleCampaignCreated}
      />
    </div>
  );
}