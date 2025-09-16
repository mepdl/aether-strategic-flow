import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Plus, FileText, Video, Mail, Image, BookOpen, Presentation, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Content {
  id: string;
  title: string;
  format: string;
  author: string;
  delivery_date: string;
  publish_date: string;
  status: string;
  persona_id?: string;
  campaign_id?: string;
}

interface Persona {
  id: string;
  persona_name: string;
}

interface Campaign {
  id: string;
  name: string;
}

const formatIcons = {
  blog_post: FileText,
  social_media: Users,
  email: Mail,
  video: Video,
  infographic: Image,
  webinar: Presentation,
  ebook: BookOpen
};

const statusColors = {
  ideas: "bg-gray-500",
  in_progress: "bg-blue-500",
  review: "bg-yellow-500",
  approved: "bg-green-500",
  published: "bg-purple-500"
};

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [content, setContent] = useState<Content[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newContent, setNewContent] = useState({
    title: "",
    format: "blog_post",
    author: "",
    delivery_date: "",
    publish_date: "",
    persona_id: "",
    campaign_id: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
    fetchPersonas();
    fetchCampaigns();
  }, []);

  const fetchContent = async () => {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .order('publish_date', { ascending: true });
    
    if (error) {
      toast({ title: "Erro ao carregar conteúdo", description: error.message, variant: "destructive" });
    } else {
      setContent(data || []);
    }
  };

  const fetchPersonas = async () => {
    const { data, error } = await supabase
      .from('personas')
      .select('id, persona_name');
    
    if (data) setPersonas(data);
  };

  const fetchCampaigns = async () => {
    const { data, error } = await supabase
      .from('campaigns')
      .select('id, name');
    
    if (data) setCampaigns(data);
  };

  const createContent = async () => {
    if (!newContent.title) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('content')
      .insert([{ 
        title: newContent.title,
        format: newContent.format as any,
        author: newContent.author,
        delivery_date: newContent.delivery_date,
        publish_date: newContent.publish_date,
        user_id: user.id,
        persona_id: newContent.persona_id || null,
        campaign_id: newContent.campaign_id || null
      }]);

    if (error) {
      toast({ title: "Erro ao criar conteúdo", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Conteúdo criado com sucesso!" });
      setShowModal(false);
      setNewContent({
        title: "",
        format: "blog_post",
        author: "",
        delivery_date: "",
        publish_date: "",
        persona_id: "",
        campaign_id: ""
      });
      fetchContent();
    }
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const getContentForDate = (date: Date) => {
    return content.filter(item => 
      isSameDay(new Date(item.publish_date), date)
    );
  };

  const formatLabels = {
    blog_post: "Blog Post",
    social_media: "Social Media",
    email: "Email",
    video: "Vídeo",
    infographic: "Infográfico", 
    webinar: "Webinar",
    ebook: "E-book"
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendário Editorial</h1>
          <p className="text-muted-foreground">Planeje e gerencie seu cronograma de conteúdo</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Conteúdo
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {format(currentDate, "MMMM yyyy", { locale: ptBR })}
                </CardTitle>
                <CardDescription>Visualização mensal do seu calendário editorial</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                >
                  ←
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Hoje
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                >
                  →
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
                  <div key={day} className="p-2 text-center font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
                {getDaysInMonth().map(date => (
                  <div 
                    key={date.toISOString()} 
                    className={`
                      min-h-[120px] p-2 border rounded-lg
                      ${!isSameMonth(date, currentDate) ? 'bg-muted/30' : 'bg-background'}
                      ${isToday(date) ? 'ring-2 ring-primary' : ''}
                    `}
                  >
                    <div className={`text-sm font-medium mb-2 ${isToday(date) ? 'text-primary' : ''}`}>
                      {format(date, "d")}
                    </div>
                    <div className="space-y-1">
                      {getContentForDate(date).map(item => {
                        const Icon = formatIcons[item.format as keyof typeof formatIcons];
                        return (
                          <div 
                            key={item.id}
                            className={`
                              text-xs p-1 rounded truncate text-white
                              ${statusColors[item.status as keyof typeof statusColors]}
                            `}
                            title={item.title}
                          >
                            <div className="flex items-center gap-1">
                              <Icon className="h-3 w-3" />
                              {item.title}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Legenda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded"></div>
                <span className="text-sm">Ideias</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm">Em Progresso</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-sm">Em Revisão</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-sm">Aprovado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span className="text-sm">Publicado</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximas Tarefas</CardTitle>
              <CardDescription>Visualização de tarefas organizadas por mês</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{format(currentDate, "MMMM yyyy", { locale: ptBR })}</h4>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                    >
                      ←
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentDate(new Date())}
                    >
                      Hoje
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                    >
                      →
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-center">
                  {["Do", "Se", "Te", "Qu", "Qu", "Se", "Sá"].map(day => (
                    <div key={day} className="p-2 text-xs font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                  {getDaysInMonth().map(date => (
                    <div 
                      key={date.toISOString()} 
                      className={`
                        p-2 text-sm border rounded aspect-square flex flex-col items-center justify-center
                        ${!isSameMonth(date, currentDate) ? 'bg-muted/30 text-muted-foreground' : 'bg-background'}
                        ${isToday(date) ? 'ring-2 ring-primary bg-primary/10' : ''}
                      `}
                    >
                      <span className={isToday(date) ? 'font-bold text-primary' : ''}>
                        {format(date, "d")}
                      </span>
                      {getContentForDate(date).map(item => (
                        <div 
                          key={item.id}
                          className="w-2 h-2 bg-primary rounded-full mt-1"
                          title={item.title}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md m-4">
            <CardHeader>
              <CardTitle>Novo Conteúdo</CardTitle>
              <CardDescription>Adicione uma nova peça ao seu calendário editorial</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Título do conteúdo"
                value={newContent.title}
                onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
              />
              <select
                className="w-full p-2 border rounded-md"
                value={newContent.format}
                onChange={(e) => setNewContent({ ...newContent, format: e.target.value })}
              >
                {Object.entries(formatLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <Input
                placeholder="Autor"
                value={newContent.author}
                onChange={(e) => setNewContent({ ...newContent, author: e.target.value })}
              />
              <Input
                type="date"
                placeholder="Data de entrega"
                value={newContent.delivery_date}
                onChange={(e) => setNewContent({ ...newContent, delivery_date: e.target.value })}
              />
              <Input
                type="date"
                placeholder="Data de publicação"
                value={newContent.publish_date}
                onChange={(e) => setNewContent({ ...newContent, publish_date: e.target.value })}
              />
              <select
                className="w-full p-2 border rounded-md"
                value={newContent.persona_id}
                onChange={(e) => setNewContent({ ...newContent, persona_id: e.target.value })}
              >
                <option value="">Selecione uma persona (opcional)</option>
                {personas.map(persona => (
                  <option key={persona.id} value={persona.id}>{persona.persona_name}</option>
                ))}
              </select>
              <select
                className="w-full p-2 border rounded-md"
                value={newContent.campaign_id}
                onChange={(e) => setNewContent({ ...newContent, campaign_id: e.target.value })}
              >
                <option value="">Selecione uma campanha (opcional)</option>
                {campaigns.map(campaign => (
                  <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button onClick={createContent} className="flex-1">
                  Criar Conteúdo
                </Button>
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}