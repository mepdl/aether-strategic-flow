import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Campaign {
  id: string;
  name: string;
  status: string;
  budget: number;
  spent: number;
  start_date: string;
  end_date: string;
  channels: string[];
  campaign_personas?: Array<{ personas: { persona_name: string } }>;
  objectives?: { title: string };
}

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
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCampaigns = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: campaignsData, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          campaign_personas(personas(persona_name)),
          objectives(title)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(campaignsData || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar campanhas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignCreated = () => {
    fetchCampaigns();
  };

  const handleToggleCampaign = async (campaignId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      
      const { error } = await supabase
        .from('campaigns')
        .update({ status: newStatus })
        .eq('id', campaignId);

      if (error) throw error;
      
      toast({
        title: "Status atualizado",
        description: `Campanha ${newStatus === 'active' ? 'ativada' : 'pausada'} com sucesso`
      });
      
      fetchCampaigns();
    } catch (error) {
      console.error('Error toggling campaign:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status da campanha",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

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
                    <p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'active').length}</p>
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
                    <p className="text-2xl font-bold">R$ {campaigns.reduce((total, c) => total + (c.budget || 0), 0).toLocaleString('pt-BR')}</p>
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
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando campanhas...</div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma campanha criada ainda.</p>
                <p className="text-sm">Clique em "Nova Campanha" para começar.</p>
              </div>
            ) : (
              campaigns.map((campaign) => (
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
                            {campaign.campaign_personas && campaign.campaign_personas.length > 0 && (
                              <>Persona: {campaign.campaign_personas.map(cp => cp.personas.persona_name).join(", ")} • </>
                            )}
                            {campaign.channels.join(", ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => toast({ title: "Em breve", description: "Gráficos serão implementados" })}
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => toast({ title: "Em breve", description: "Configurações serão implementadas" })}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleToggleCampaign(campaign.id, campaign.status)}
                        >
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
                        <span>R$ {(campaign.spent || 0).toLocaleString('pt-BR')} / R$ {(campaign.budget || 0).toLocaleString('pt-BR')}</span>
                      </div>
                      <Progress value={campaign.budget ? (campaign.spent || 0) / campaign.budget * 100 : 0} className="h-2" />
                    </div>

                    {/* Objectives */}
                    {campaign.objectives && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Objetivos Vinculados
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {campaign.objectives.title}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    {(campaign.start_date || campaign.end_date) && (
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {campaign.start_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Início: {new Date(campaign.start_date).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}
                        {campaign.start_date && campaign.end_date && <span>•</span>}
                        {campaign.end_date && (
                          <span>Fim: {new Date(campaign.end_date).toLocaleDateString('pt-BR')}</span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
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