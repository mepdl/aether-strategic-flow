import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MapPin, Briefcase, Target, AlertTriangle, Users, Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PersonaRow {
  id: string;
  persona_name: string;
  role: string | null;
  avatar_url: string | null;
  demographics: any | null;
  goals: string | null;
  pain_points: string | null;
}

export default function Personas() {
  const [personas, setPersonas] = useState<PersonaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PersonaRow | null>(null);
  const { toast } = useToast();

  // Form state
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [goals, setGoals] = useState("");
  const [painPoints, setPainPoints] = useState("");
  const [teamEmail, setTeamEmail] = useState("");
  const [teamRole, setTeamRole] = useState("");

  useEffect(() => {
    fetchPersonas();
  }, []);

  useEffect(() => {
    if (editing) {
      setName(editing.persona_name || "");
      setRole(editing.role || "");
      setAge(editing.demographics?.age ? String(editing.demographics.age) : "");
      setLocation(editing.demographics?.location || "");
    setGoals(editing.goals || "");
    setPainPoints(editing.pain_points || "");
    setTeamEmail("");
    setTeamRole("");
    setIsDialogOpen(true);
    }
  }, [editing]);

  const totalCampaigns = useMemo(() => 0, []); // Placeholder (poderíamos somar por relacionamento)

  const fetchPersonas = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPersonas([]);
        return;
      }
      const { data, error } = await supabase
        .from("personas")
        .select("id, persona_name, role, avatar_url, demographics, goals, pain_points")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setPersonas(data || []);
    } catch (e) {
      console.error(e);
      toast({ title: "Erro", description: "Falha ao carregar personas.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setRole("");
    setAge("");
    setLocation("");
    setGoals("");
    setPainPoints("");
    setTeamEmail("");
    setTeamRole("");
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: "Nome obrigatório", description: "Informe o nome da persona.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const payload = {
        persona_name: name.trim(),
        role: role.trim() || null,
        demographics: {
          age: age ? Number(age) : null,
          location: location || null,
        },
        goals: goals || null,
        pain_points: painPoints || null,
        user_id: user.id,
      } as any;

      if (editing) {
      const { error } = await supabase.from("personas").update(payload).eq("id", editing.id).eq("user_id", user.id);
      if (error) throw error;
      
      // Add team member if provided
      if (teamEmail && teamRole) {
        const { error: teamError } = await supabase.from("persona_team_members").insert({
          persona_id: editing.id,
          email: teamEmail,
          role: teamRole
        });
        if (teamError) console.error("Team member error:", teamError);
      }
      
      toast({ title: "Persona atualizada", description: "As alterações foram salvas." });
      } else {
      const { data: newPersona, error } = await supabase.from("personas").insert([payload]).select().single();
      if (error) throw error;
      
      // Add team member if provided
      if (teamEmail && teamRole && newPersona) {
        const { error: teamError } = await supabase.from("persona_team_members").insert({
          persona_id: newPersona.id,
          email: teamEmail,
          role: teamRole
        });
        if (teamError) console.error("Team member error:", teamError);
      }
      
      toast({ title: "Persona criada", description: "Nova persona adicionada com sucesso." });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPersonas();
    } catch (e) {
      console.error(e);
      toast({ title: "Erro", description: "Não foi possível salvar a persona.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      const { error } = await supabase.from("personas").delete().eq("id", id).eq("user_id", user.id);
      if (error) throw error;
      toast({ title: "Persona excluída", description: "A persona foi removida." });
      fetchPersonas();
    } catch (e) {
      console.error(e);
      toast({ title: "Erro", description: "Não foi possível excluir a persona.", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personas</h1>
          <p className="text-muted-foreground">Gerencie as personas do seu público-alvo para campanhas direcionadas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-primary" onClick={openCreate}>
              <Plus className="w-4 h-4" />
              Nova Persona
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar Persona" : "Criar Nova Persona"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Persona</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Maria, a Gerente de Marketing" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Cargo/Função</Label>
                <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Ex: Gerente de Marketing" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Idade</Label>
                <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Ex: 35" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Localização</Label>
                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ex: São Paulo, Brasil" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="goals">Objetivos (um por linha)</Label>
                <Textarea id="goals" value={goals} onChange={(e) => setGoals(e.target.value)} placeholder={"Aumentar geração de leads\nProvar ROI das ações"} rows={3} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="painPoints">Pontos de Dor (um por linha)</Label>
                <Textarea id="painPoints" value={painPoints} onChange={(e) => setPainPoints(e.target.value)} placeholder={"Falta de tempo\nDificuldade em medir resultados"} rows={3} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="teamEmail">Email do Participante</Label>
                <Input id="teamEmail" value={teamEmail} onChange={(e) => setTeamEmail(e.target.value)} placeholder="email@exemplo.com" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="teamRole">Função do Participante</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={teamRole}
                  onChange={(e) => setTeamRole(e.target.value)}
                >
                  <option value="">Selecione uma função</option>
                  <option value="gerente_marketing">Gerente de Marketing</option>
                  <option value="analista_marketing">Analista de Marketing</option>
                  <option value="assistente_marketing">Assistente de Marketing</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                Cancelar
              </Button>
              <Button className="gradient-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</> : editing ? "Salvar" : "Criar Persona"}
              </Button>
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
                <p className="text-2xl font-bold">{personas.length}</p>
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
                <p className="text-2xl font-bold">{totalCampaigns}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Mercados</p>
                <p className="text-2xl font-bold">-</p>
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
                <p className="text-2xl font-bold">-</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Personas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-lg">Carregando...</CardTitle>
                <CardDescription>Aguarde</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-24 bg-muted/40 rounded" />
              </CardContent>
            </Card>
          ))
        ) : personas.length === 0 ? (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Nenhuma persona</CardTitle>
              <CardDescription>Crie sua primeira persona para começar.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          personas.map((p) => (
            <Card key={p.id} className="hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={p.avatar_url || undefined} alt={p.persona_name} />
                      <AvatarFallback className="gradient-primary text-white">
                        {p.persona_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{p.persona_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{p.role || "—"}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(p)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir persona?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente a persona.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}>
                            {deletingId === p.id ? "Excluindo..." : "Excluir"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{p.demographics?.location || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span>{p.demographics?.age ? `${p.demographics.age} anos` : "—"}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Objetivos
                  </h4>
                  <div className="space-y-1">
                    {(p.goals || "").split("\n").filter(Boolean).slice(0,2).map((g, i) => (
                      <p key={i} className="text-sm text-muted-foreground">• {g}</p>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Pontos de Dor
                  </h4>
                  <div className="space-y-1">
                    {(p.pain_points || "").split("\n").filter(Boolean).slice(0,2).map((pp, i) => (
                      <p key={i} className="text-sm text-muted-foreground">• {pp}</p>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">0 campanhas ativas</Badge>
                    <Button variant="link" size="sm" className="text-xs p-0 h-auto">Ver detalhes</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
