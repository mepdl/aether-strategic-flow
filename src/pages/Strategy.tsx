import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Target, Users, TrendingUp, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Objective {
  id: string;
  title: string;
  description: string;
  quarter: string;
  year: number;
}

interface KeyResult {
  id: string;
  objective_id: string;
  title: string;
  target_value: number;
  current_value: number;
  unit: string;
}

interface SwotAnalysis {
  id: string;
  strengths: string;
  weaknesses: string;
  opportunities: string;
  threats: string;
}

interface BrandIdentity {
  id: string;
  mission: string;
  vision: string;
  positioning: string;
  values: string;
}

export default function Strategy() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [keyResults, setKeyResults] = useState<KeyResult[]>([]);
  const [swotAnalysis, setSwotAnalysis] = useState<SwotAnalysis | null>(null);
  const [brandIdentity, setBrandIdentity] = useState<BrandIdentity | null>(null);
  const [newObjective, setNewObjective] = useState({ title: "", description: "", quarter: "Q1" });
  const [newKeyResult, setNewKeyResult] = useState({ objective_id: "", title: "", target_value: 0, unit: "" });
  const [newSwot, setNewSwot] = useState({ strengths: "", weaknesses: "", opportunities: "", threats: "" });
  const [newBrand, setNewBrand] = useState({ mission: "", vision: "", positioning: "", values: "" });
  const { toast } = useToast();

  useEffect(() => {
    fetchObjectives();
    fetchKeyResults();
    fetchSwotAnalysis();
    fetchBrandIdentity();
  }, []);

  const fetchObjectives = async () => {
    const { data, error } = await supabase
      .from('objectives')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: "Erro ao carregar objetivos", description: error.message, variant: "destructive" });
    } else {
      setObjectives(data || []);
    }
  };

  const fetchKeyResults = async () => {
    const { data, error } = await supabase
      .from('key_results')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: "Erro ao carregar resultados-chave", description: error.message, variant: "destructive" });
    } else {
      setKeyResults(data || []);
    }
  };

  const fetchSwotAnalysis = async () => {
    const { data, error } = await supabase
      .from('swot_analysis')
      .select('*')
      .limit(1)
      .single();
    
    if (data) {
      setSwotAnalysis(data);
      setNewSwot(data);
    }
  };

  const fetchBrandIdentity = async () => {
    const { data, error } = await supabase
      .from('brand_identity')
      .select('*')
      .limit(1)
      .single();
    
    if (data) {
      setBrandIdentity(data);
      setNewBrand(data);
    }
  };

  const createObjective = async () => {
    if (!newObjective.title) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('objectives')
      .insert([{ ...newObjective, user_id: user.id, year: new Date().getFullYear() }]);

    if (error) {
      toast({ title: "Erro ao criar objetivo", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Objetivo criado com sucesso!" });
      setNewObjective({ title: "", description: "", quarter: "Q1" });
      fetchObjectives();
    }
  };

  const createKeyResult = async () => {
    if (!newKeyResult.title || !newKeyResult.objective_id) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('key_results')
      .insert([{ ...newKeyResult, user_id: user.id }]);

    if (error) {
      toast({ title: "Erro ao criar resultado-chave", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Resultado-chave criado com sucesso!" });
      setNewKeyResult({ objective_id: "", title: "", target_value: 0, unit: "" });
      fetchKeyResults();
    }
  };

  const saveSwotAnalysis = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = swotAnalysis
      ? await supabase.from('swot_analysis').update(newSwot).eq('id', swotAnalysis.id)
      : await supabase.from('swot_analysis').insert([{ ...newSwot, user_id: user.id }]);

    if (error) {
      toast({ title: "Erro ao salvar análise SWOT", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Análise SWOT salva com sucesso!" });
      fetchSwotAnalysis();
    }
  };

  const saveBrandIdentity = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = brandIdentity
      ? await supabase.from('brand_identity').update(newBrand).eq('id', brandIdentity.id)
      : await supabase.from('brand_identity').insert([{ ...newBrand, user_id: user.id }]);

    if (error) {
      toast({ title: "Erro ao salvar identidade da marca", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Identidade da marca salva com sucesso!" });
      fetchBrandIdentity();
    }
  };

  const getKeyResultsForObjective = (objectiveId: string) => {
    return keyResults.filter(kr => kr.objective_id === objectiveId);
  };

  const getProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estratégia</h1>
          <p className="text-muted-foreground">Defina seus objetivos, analise mercado e planeje sua estratégia</p>
        </div>
      </div>

      <Tabs defaultValue="objectives" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="objectives" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            OKRs
          </TabsTrigger>
          <TabsTrigger value="swot" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Análise SWOT
          </TabsTrigger>
          <TabsTrigger value="market" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Mercado
          </TabsTrigger>
          <TabsTrigger value="brand" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Marca
          </TabsTrigger>
        </TabsList>

        <TabsContent value="objectives" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Criar Novo Objetivo</CardTitle>
                <CardDescription>Defina objetivos estratégicos claros e mensuráveis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Título do objetivo"
                  value={newObjective.title}
                  onChange={(e) => setNewObjective({ ...newObjective, title: e.target.value })}
                />
                <Textarea
                  placeholder="Descrição detalhada"
                  value={newObjective.description}
                  onChange={(e) => setNewObjective({ ...newObjective, description: e.target.value })}
                />
                <select
                  className="w-full p-2 border rounded-md"
                  value={newObjective.quarter}
                  onChange={(e) => setNewObjective({ ...newObjective, quarter: e.target.value })}
                >
                  <option value="Q1">Q1</option>
                  <option value="Q2">Q2</option>
                  <option value="Q3">Q3</option>
                  <option value="Q4">Q4</option>
                </select>
                <Button onClick={createObjective} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Objetivo
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Adicionar Resultado-Chave</CardTitle>
                <CardDescription>Métricas específicas para medir o sucesso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <select
                  className="w-full p-2 border rounded-md"
                  value={newKeyResult.objective_id}
                  onChange={(e) => setNewKeyResult({ ...newKeyResult, objective_id: e.target.value })}
                >
                  <option value="">Selecione um objetivo</option>
                  {objectives.map(obj => (
                    <option key={obj.id} value={obj.id}>{obj.title}</option>
                  ))}
                </select>
                <Input
                  placeholder="Descrição do resultado"
                  value={newKeyResult.title}
                  onChange={(e) => setNewKeyResult({ ...newKeyResult, title: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Meta"
                    value={newKeyResult.target_value}
                    onChange={(e) => setNewKeyResult({ ...newKeyResult, target_value: Number(e.target.value) })}
                  />
                  <Input
                    placeholder="Unidade"
                    value={newKeyResult.unit}
                    onChange={(e) => setNewKeyResult({ ...newKeyResult, unit: e.target.value })}
                  />
                </div>
                <Button onClick={createKeyResult} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Resultado
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Objetivos Atuais</h3>
            <div className="grid gap-4">
              {objectives.map(objective => (
                <Card key={objective.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{objective.title}</CardTitle>
                      <Badge variant="secondary">{objective.quarter} {objective.year}</Badge>
                    </div>
                    <CardDescription>{objective.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getKeyResultsForObjective(objective.id).map(kr => (
                        <div key={kr.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{kr.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-full bg-secondary rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                  style={{ width: `${getProgress(kr.current_value, kr.target_value)}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground whitespace-nowrap">
                                {kr.current_value}/{kr.target_value} {kr.unit}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="swot" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise SWOT</CardTitle>
              <CardDescription>Analise forças, fraquezas, oportunidades e ameaças</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-green-600">Forças</label>
                  <Textarea
                    placeholder="Liste suas forças internas..."
                    value={newSwot.strengths}
                    onChange={(e) => setNewSwot({ ...newSwot, strengths: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-red-600">Fraquezas</label>
                  <Textarea
                    placeholder="Liste suas fraquezas internas..."
                    value={newSwot.weaknesses}
                    onChange={(e) => setNewSwot({ ...newSwot, weaknesses: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-600">Oportunidades</label>
                  <Textarea
                    placeholder="Liste oportunidades externas..."
                    value={newSwot.opportunities}
                    onChange={(e) => setNewSwot({ ...newSwot, opportunities: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-orange-600">Ameaças</label>
                  <Textarea
                    placeholder="Liste ameaças externas..."
                    value={newSwot.threats}
                    onChange={(e) => setNewSwot({ ...newSwot, threats: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={saveSwotAnalysis} className="w-full">
                Salvar Análise SWOT
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Mercado</CardTitle>
              <CardDescription>Em breve: Análise de concorrentes e inteligência de mercado</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="brand">
          <Card>
            <CardHeader>
              <CardTitle>Identidade da Marca</CardTitle>
              <CardDescription>Defina a missão, visão, posicionamento e valores da sua marca</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Missão</label>
                  <Textarea
                    placeholder="Defina a missão da sua empresa - o propósito fundamental..."
                    value={newBrand.mission}
                    onChange={(e) => setNewBrand({ ...newBrand, mission: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Visão</label>
                  <Textarea
                    placeholder="Defina a visão da sua empresa - aonde vocês querem chegar..."
                    value={newBrand.vision}
                    onChange={(e) => setNewBrand({ ...newBrand, vision: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Posicionamento</label>
                  <Textarea
                    placeholder="Defina como sua marca se posiciona no mercado..."
                    value={newBrand.positioning}
                    onChange={(e) => setNewBrand({ ...newBrand, positioning: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Valores</label>
                  <Textarea
                    placeholder="Liste os valores fundamentais da sua empresa..."
                    value={newBrand.values}
                    onChange={(e) => setNewBrand({ ...newBrand, values: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <Button onClick={saveBrandIdentity} className="w-full">
                Salvar Identidade da Marca
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}