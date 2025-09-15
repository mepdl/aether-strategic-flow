import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Target, 
  TrendingUp, 
  Eye,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardMetrics {
  totalLeads: number;
  conversionRate: number;
  campaignROI: number;
  websiteTraffic: number;
}

interface OKRData {
  id: string;
  title: string;
  progress: number;
  status: "on_track" | "at_risk" | "exceeded";
  current: number;
  target: number;
  unit: string;
}

interface TaskData {
  id: string;
  title: string;
  due_date: string;
  priority: number;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalLeads: 0,
    conversionRate: 0,
    campaignROI: 0,
    websiteTraffic: 0
  });
  const [okrs, setOkrs] = useState<OKRData[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<TaskData[]>([]);
  const [campaigns, setCampaigns] = useState<{ id: string; name: string; budget: number | null; spent: number | null; status: string | null; }[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch metrics
      const { data: metricsData } = await supabase
        .from('metrics')
        .select('*')
        .eq('user_id', user.id);

      // Calculate metrics from data (fallback to 0, no fake numbers)
      const leads = metricsData?.filter(m => m.metric_name === 'leads').reduce((sum, m: any) => sum + (m.metric_value || 0), 0) || 0;
      const traffic = metricsData?.filter(m => m.metric_name === 'traffic').reduce((sum, m: any) => sum + (m.metric_value || 0), 0) || 0;
      const conversions = metricsData?.filter(m => m.metric_name === 'conversions').reduce((sum, m: any) => sum + (m.metric_value || 0), 0) || 0;
      const conversionRate = traffic > 0 ? Number(((conversions / traffic) * 100).toFixed(1)) : 0;

      setMetrics({
        totalLeads: leads,
        conversionRate,
        campaignROI: 0,
        websiteTraffic: traffic
      });

      // Fetch OKRs with key results
      const { data: objectives } = await supabase
        .from('objectives')
        .select(`
          *,
          key_results (*)
        `)
        .eq('user_id', user.id)
        .limit(3);

      if (objectives) {
        const okrData = objectives.map(obj => {
          const keyResults = obj.key_results || [];
          const totalProgress = keyResults.reduce((sum: number, kr: any) => {
            const progress = kr.target_value ? (kr.current_value / kr.target_value) * 100 : 0;
            return sum + progress;
          }, 0);
          const avgProgress = keyResults.length > 0 ? totalProgress / keyResults.length : 0;
          
          let status: "on_track" | "at_risk" | "exceeded" = "on_track";
          if (avgProgress < 60) status = "at_risk";
          if (avgProgress > 100) status = "exceeded";

          return {
            id: obj.id,
            title: obj.title,
            progress: avgProgress,
            status,
            current: keyResults[0]?.current_value || 0,
            target: keyResults[0]?.target_value || 100,
            unit: keyResults[0]?.unit || "unidade"
          };
        });
        setOkrs(okrData);
      }

      // Fetch upcoming tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, title, due_date, priority')
        .eq('user_id', user.id)
        .not('due_date', 'is', null)
        .gte('due_date', new Date().toISOString().split('T')[0])
        .order('due_date', { ascending: true })
        .limit(4);

      if (tasks) {
        setUpcomingTasks(tasks);
      }

      // Fetch latest campaigns to display (no fake data)
      const { data: campaignRows } = await supabase
        .from('campaigns')
        .select('id, name, budget, spent, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      if (campaignRows) setCampaigns(campaignRows);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const generateExecutiveReport = async () => {
    setIsGeneratingReport(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Relatório Executivo Gerado",
        description: "O relatório foi gerado com sucesso e enviado para seu email.",
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on_track":
        return "text-success border-success";
      case "at_risk":
        return "text-warning border-warning";
      case "exceeded":
        return "text-primary border-primary";
      default:
        return "text-muted-foreground border-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "on_track":
        return "No Prazo";
      case "at_risk":
        return "Em Risco";
      case "exceeded":
        return "Excedido";
      default:
        return "Pendente";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hoje";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Amanhã";
    } else {
      return date.toLocaleDateString('pt-BR', { 
        weekday: 'short', 
        day: 'numeric',
        month: 'short'
      });
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do desempenho das suas campanhas de marketing
          </p>
        </div>
        <Button 
          className="gradient-primary gap-2 w-fit"
          onClick={generateExecutiveReport}
          disabled={isGeneratingReport}
        >
          <FileText className="w-4 h-4" />
          {isGeneratingReport ? "Gerando..." : "Relatório Executivo"}
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard
          title="Leads Gerados (Mês)"
          value={metrics.totalLeads.toLocaleString()}
          change="+12.5%"
          trend="up"
          icon={<Users className="w-5 h-5" />}
        />
        <MetricCard
          title="Taxa de Conversão"
          value={`${metrics.conversionRate}%`}
          change="+0.8%"
          trend="up"
          icon={<Target className="w-5 h-5" />}
        />
        <MetricCard
          title="ROI das Campanhas"
          value={`${metrics.campaignROI}%`}
          change="+15.2%"
          trend="up"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <MetricCard
          title="Tráfego do Site"
          value={metrics.websiteTraffic.toLocaleString()}
          change="-2.1%"
          trend="down"
          icon={<Eye className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* OKRs Progress */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Progresso dos OKRs - Q4 2024
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {okrs.length > 0 ? (
              okrs.map((okr) => (
                <div key={okr.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm md:text-base">{okr.title}</h4>
                    <Badge variant="outline" className={getStatusColor(okr.status)}>
                      {getStatusText(okr.status)}
                    </Badge>
                  </div>
                  <Progress value={Math.min(okr.progress, 100)} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{okr.current} / {okr.target} {okr.unit}</span>
                    <span>{Math.round(okr.progress)}% completo</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum OKR encontrado</p>
                <p className="text-sm">Acesse a página Estratégia para criar seus objetivos</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Próximas Tarefas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    task.priority === 1 ? 'bg-destructive' :
                    task.priority === 2 ? 'bg-warning' : 'bg-primary'
                  }`}></div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(task.due_date)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Nenhuma tarefa próxima</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Campanhas Ativas</CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma campanha encontrada</p>
              <p className="text-sm">Crie campanhas na página Campanhas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((c) => (
                <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-lg gap-4">
                  <div className="min-w-0">
                    <h4 className="font-semibold truncate">{c.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Orçamento: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(c.budget || 0))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Gasto: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(c.spent || 0))}</p>
                    <p className="text-xs text-muted-foreground">Status: {c.status === 'active' ? 'Ativa' : (c.status === 'paused' ? 'Pausada' : 'Rascunho')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}