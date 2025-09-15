import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Persona {
  id: string;
  persona_name: string;
}

interface Objective {
  id: string;
  title: string;
}

const marketingChannels = [
  'seo',
  'ppc',
  'social_media',
  'email',
  'content',
  'pr',
  'events'
] as const;

const getChannelLabel = (channel: string) => {
  const labels: { [key: string]: string } = {
    seo: 'SEO',
    ppc: 'PPC',
    social_media: 'Mídias Sociais',
    email: 'Email',
    content: 'Conteúdo',
    pr: 'Relações Públicas',
    events: 'Eventos'
  };
  return labels[channel] || channel;
};

export function CampaignModal({ isOpen, onClose, onSuccess }: CampaignModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    budget: "",
    spent: "0",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    objectiveId: "",
    status: "active"
  });
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch personas
      const { data: personasData } = await supabase
        .from('personas')
        .select('id, persona_name')
        .eq('user_id', user.id);

      if (personasData) setPersonas(personasData);

      // Fetch objectives
      const { data: objectivesData } = await supabase
        .from('objectives')
        .select('id, title')
        .eq('user_id', user.id);

      if (objectivesData) setObjectives(objectivesData);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChannelChange = (channel: string, checked: boolean) => {
    if (checked) {
      setSelectedChannels([...selectedChannels, channel]);
    } else {
      setSelectedChannels(selectedChannels.filter(c => c !== channel));
    }
  };

  const handlePersonaChange = (personaId: string, checked: boolean) => {
    if (checked) {
      setSelectedPersonas([...selectedPersonas, personaId]);
    } else {
      setSelectedPersonas(selectedPersonas.filter(p => p !== personaId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }

      // Create campaign
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .insert([{
          name: formData.name,
          description: formData.description,
          budget: parseFloat(formData.budget) || 0,
          spent: parseFloat(formData.spent) || 0,
          start_date: formData.startDate?.toISOString().split('T')[0],
          end_date: formData.endDate?.toISOString().split('T')[0],
          objective_id: formData.objectiveId || null,
          status: formData.status as any,
          channels: selectedChannels as any,
          user_id: user.id
        }])
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Create campaign-persona relationships
      if (selectedPersonas.length > 0 && campaignData) {
        const campaignPersonaData = selectedPersonas.map(personaId => ({
          campaign_id: campaignData.id,
          persona_id: personaId
        }));

        const { error: personaError } = await supabase
          .from('campaign_personas')
          .insert(campaignPersonaData);

        if (personaError) {
          console.error('Error linking personas:', personaError);
        }
      }

      toast({
        title: "Campanha criada",
        description: "Campanha criada com sucesso!",
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        budget: "",
        spent: "0",
        startDate: undefined,
        endDate: undefined,
        objectiveId: "",
        status: "active"
      });
      setSelectedChannels([]);
      setSelectedPersonas([]);
      
      onSuccess();
      onClose();

    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar campanha. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Campanha</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Campanha *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Lançamento Produto X - Q4"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Descreva os objetivos e estratégia da campanha..."
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Orçamento (€)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  placeholder="20000"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativa</SelectItem>
                    <SelectItem value="paused">Pausada</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "PPP", {locale: ptBR}) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => setFormData({...formData, startDate: date})}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data de Fim</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, "PPP", {locale: ptBR}) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => setFormData({...formData, endDate: date})}
                    initialFocus
                    className="pointer-events-auto"
                    disabled={(date) => formData.startDate ? date < formData.startDate : false}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Objective */}
          {objectives.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="objective">Objetivo Vinculado</Label>
              <Select value={formData.objectiveId} onValueChange={(value) => setFormData({...formData, objectiveId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar objetivo (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {objectives.map((obj) => (
                    <SelectItem key={obj.id} value={obj.id}>
                      {obj.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Personas */}
          {personas.length > 0 && (
            <div className="space-y-2">
              <Label>Personas Alvo</Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {personas.map((persona) => (
                  <div key={persona.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`persona-${persona.id}`}
                      checked={selectedPersonas.includes(persona.id)}
                      onCheckedChange={(checked) => handlePersonaChange(persona.id, checked as boolean)}
                    />
                    <Label htmlFor={`persona-${persona.id}`} className="text-sm">
                      {persona.persona_name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Marketing Channels */}
          <div className="space-y-2">
            <Label>Canais de Marketing</Label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
              {marketingChannels.map((channel) => (
                <div key={channel} className="flex items-center space-x-2">
                  <Checkbox
                    id={`channel-${channel}`}
                    checked={selectedChannels.includes(channel)}
                    onCheckedChange={(checked) => handleChannelChange(channel, checked as boolean)}
                  />
                  <Label htmlFor={`channel-${channel}`} className="text-sm">
                    {getChannelLabel(channel)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.name || isLoading}
              className="gradient-primary"
            >
              {isLoading ? "Criando..." : "Criar Campanha"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}