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
  AlertCircle
} from "lucide-react";

export default function Dashboard() {
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
        <Button className="gradient-primary">
          Relatório Executivo
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Leads Gerados (Mês)"
          value="1,247"
          change="+12.5%"
          trend="up"
          icon={<Users className="w-5 h-5" />}
        />
        <MetricCard
          title="Taxa de Conversão"
          value="3.2%"
          change="+0.8%"
          trend="up"
          icon={<Target className="w-5 h-5" />}
        />
        <MetricCard
          title="ROI das Campanhas"
          value="245%"
          change="+15.2%"
          trend="up"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <MetricCard
          title="Tráfego do Site"
          value="28,432"
          change="-2.1%"
          trend="down"
          icon={<Eye className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* OKRs Progress */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Progresso dos OKRs - Q4 2024
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Aumentar Geração de Leads em 25%</h4>
                <Badge variant="outline" className="text-success border-success">
                  No Prazo
                </Badge>
              </div>
              <Progress value={85} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>1,247 / 1,500 leads</span>
                <span>85% completo</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Lançar Campanha Produto X</h4>
                <Badge variant="outline" className="text-warning border-warning">
                  Em Risco
                </Badge>
              </div>
              <Progress value={60} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>6 / 10 tarefas concluídas</span>
                <span>60% completo</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Melhorar Taxa de Conversão em 15%</h4>
                <Badge variant="outline" className="text-success border-success">
                  Excedido
                </Badge>
              </div>
              <Progress value={120} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>3.2% / 2.8% meta</span>
                <span>120% da meta</span>
              </div>
            </div>
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
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Revisar conteúdo blog</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Hoje, 14:00
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-secondary mt-2 flex-shrink-0"></div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Webinar Produto X</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Amanhã, 10:00
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0"></div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Análise campanhas sociais</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Sex, 16:00
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2 flex-shrink-0"></div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Reunião mensal ROI</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Próx. Seg, 09:00
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Campanhas Ativas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <div>
                  <h4 className="font-semibold">Lançamento Produto X - Q4</h4>
                  <p className="text-sm text-muted-foreground">
                    Persona: Fundador de Startup • Orçamento: €20,000
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">€12,340 gastos</p>
                  <p className="text-xs text-muted-foreground">ROI: 180%</p>
                </div>
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-warning"></div>
                <div>
                  <h4 className="font-semibold">Campanha Retenção Clientes</h4>
                  <p className="text-sm text-muted-foreground">
                    Persona: Cliente Existente • Orçamento: €8,500
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">€7,890 gastos</p>
                  <p className="text-xs text-muted-foreground">ROI: 95%</p>
                </div>
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <div>
                  <h4 className="font-semibold">SEO & Content Marketing</h4>
                  <p className="text-sm text-muted-foreground">
                    Persona: Múltiplas • Orçamento: €15,000
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">€9,200 gastos</p>
                  <p className="text-xs text-muted-foreground">ROI: 220%</p>
                </div>
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}