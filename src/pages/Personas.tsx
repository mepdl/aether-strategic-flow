import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  Plus, 
  MapPin, 
  Briefcase, 
  Target,
  AlertTriangle,
  Globe,
  Edit2,
  Trash2
} from "lucide-react";

const mockPersonas = [
  {
    id: 1,
    name: "Mariana, a Gerente de Marketing",
    role: "Gerente de Marketing",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b647?w=150&h=150&fit=crop&crop=face",
    demographics: {
      age: 35,
      location: "São Paulo, Brasil",
      education: "MBA em Marketing",
      income: "€45,000 - €65,000"
    },
    goals: [
      "Aumentar geração de leads qualificados",
      "Provar ROI das ações de marketing",
      "Otimizar processos de marketing"
    ],
    painPoints: [
      "Falta de tempo para gerenciar múltiplos canais",
      "Dificuldade em medir resultados integrados",
      "Pressão por resultados imediatos"
    ],
    channels: ["LinkedIn", "Blogs de MarTech", "Eventos do setor"],
    campaigns: 3
  },
  {
    id: 2,
    name: "Pedro, o Fundador de Startup",
    role: "CEO/Fundador",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    demographics: {
      age: 32,
      location: "Lisboa, Portugal",
      education: "Engenharia + MBA",
      income: "€60,000+"
    },
    goals: [
      "Validar product-market fit",
      "Acelerar crescimento da empresa",
      "Captar investimento Series A"
    ],
    painPoints: [
      "Recursos limitados para marketing",
      "Necessidade de crescimento rápido",
      "Competição com empresas maiores"
    ],
    channels: ["Product Hunt", "TechCrunch", "Networking"],
    campaigns: 2
  },
  {
    id: 3,
    name: "Ana, a Diretora Comercial",
    role: "Diretora Comercial",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    demographics: {
      age: 42,
      location: "Porto, Portugal",
      education: "Gestão Comercial",
      income: "€55,000 - €75,000"
    },
    goals: [
      "Aumentar qualidade dos leads",
      "Reduzir ciclo de vendas",
      "Melhorar alinhamento marketing-vendas"
    ],
    painPoints: [
      "Leads de baixa qualidade",
      "Falta de informação sobre prospects",
      "Desalinhamento com marketing"
    ],
    channels: ["LinkedIn Sales Navigator", "Eventos B2B", "Webinars"],
    campaigns: 1
  }
];

export default function Personas() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personas</h1>
          <p className="text-muted-foreground">
            Gerencie as personas do seu público-alvo para campanhas direcionadas
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-primary">
              <Plus className="w-4 h-4" />
              Nova Persona
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Persona</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Persona</Label>
                <Input id="name" placeholder="Ex: Maria, a Gerente de Marketing" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Cargo/Função</Label>
                <Input id="role" placeholder="Ex: Gerente de Marketing" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Idade</Label>
                <Input id="age" type="number" placeholder="Ex: 35" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Localização</Label>
                <Input id="location" placeholder="Ex: São Paulo, Brasil" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="goals">Objetivos (um por linha)</Label>
                <Textarea id="goals" placeholder="Aumentar geração de leads&#10;Provar ROI das ações" rows={3} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="painPoints">Pontos de Dor (um por linha)</Label>
                <Textarea id="painPoints" placeholder="Falta de tempo&#10;Dificuldade em medir resultados" rows={3} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button className="gradient-primary">Criar Persona</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Personas</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-secondary" />
              <div>
                <p className="text-sm text-muted-foreground">Campanhas Ativas</p>
                <p className="text-2xl font-bold">6</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Mercados</p>
                <p className="text-2xl font-bold">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Setores</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Personas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockPersonas.map((persona) => (
          <Card key={persona.id} className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={persona.avatar} alt={persona.name} />
                    <AvatarFallback className="gradient-primary text-white">
                      {persona.name.split(',')[0].charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{persona.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{persona.role}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Demographics */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{persona.demographics.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span>{persona.demographics.age} anos • {persona.demographics.education}</span>
                </div>
              </div>

              {/* Goals */}
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Objetivos
                </h4>
                <div className="space-y-1">
                  {persona.goals.slice(0, 2).map((goal, index) => (
                    <p key={index} className="text-sm text-muted-foreground">• {goal}</p>
                  ))}
                  {persona.goals.length > 2 && (
                    <p className="text-xs text-muted-foreground">+{persona.goals.length - 2} mais</p>
                  )}
                </div>
              </div>

              {/* Pain Points */}
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Pontos de Dor
                </h4>
                <div className="space-y-1">
                  {persona.painPoints.slice(0, 2).map((pain, index) => (
                    <p key={index} className="text-sm text-muted-foreground">• {pain}</p>
                  ))}
                </div>
              </div>

              {/* Campaigns */}
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {persona.campaigns} campanhas ativas
                  </Badge>
                  <Button variant="link" size="sm" className="text-xs p-0 h-auto">
                    Ver detalhes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}