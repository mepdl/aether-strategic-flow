import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Kanban, 
  Plus, 
  Calendar,
  Target,
  CheckCircle,
  AlertCircle,
  Play,
  Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type TaskStatus = Database['public']['Enums']['task_status'];

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: number;
  due_date: string;
  campaign_id?: string;
}

interface Campaign {
  id: string;
  name: string;
}

const statusColumns = [
  { id: 'ideas', title: 'Ideias', color: 'bg-gray-100' },
  { id: 'in_progress', title: 'Em Progresso', color: 'bg-blue-100' },
  { id: 'review', title: 'Em Revisão', color: 'bg-yellow-100' },
  { id: 'approved', title: 'Aprovado', color: 'bg-green-100' },
  { id: 'published', title: 'Publicado', color: 'bg-purple-100' }
];

const priorityColors = {
  1: 'border-red-500',
  2: 'border-orange-500',
  3: 'border-blue-500',
  4: 'border-gray-500',
  5: 'border-green-500'
};

const priorityLabels = {
  1: 'Crítica',
  2: 'Alta',
  3: 'Média',
  4: 'Baixa',
  5: 'Muito Baixa'
};

export default function Projects() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    priority: number;
    due_date: string;
    campaign_id: string;
    status: TaskStatus;
  }>({
    title: "",
    description: "",
    priority: 3,
    due_date: "",
    campaign_id: "",
    status: "ideas" as TaskStatus
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
    fetchCampaigns();
  }, []);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: "Erro ao carregar tarefas", description: error.message, variant: "destructive" });
    } else {
      setTasks(data || []);
    }
  };

  const fetchCampaigns = async () => {
    const { data, error } = await supabase
      .from('campaigns')
      .select('id, name');
    
    if (data) setCampaigns(data);
  };

  const createTask = async () => {
    if (!newTask.title) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('tasks')
      .insert([{ 
        ...newTask, 
        user_id: user.id,
        campaign_id: newTask.campaign_id || null
      }]);

    if (error) {
      toast({ title: "Erro ao criar tarefa", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Tarefa criada com sucesso!" });
      setShowModal(false);
      setNewTask({
        title: "",
        description: "",
        priority: 3,
        due_date: "",
        campaign_id: "",
        status: "ideas" as TaskStatus
      });
      fetchTasks();
    }
  };

  const getTasksForStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const getPriorityColor = (priority: number) => {
    return priorityColors[priority as keyof typeof priorityColors] || 'border-gray-500';
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projetos</h1>
          <p className="text-muted-foreground">Gerencie projetos, tarefas e fluxos de trabalho</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Tarefas</p>
                <p className="text-2xl font-bold">{tasks.length}</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Progresso</p>
                <p className="text-2xl font-bold text-blue-600">
                  {tasks.filter(task => task.status === 'in_progress').length}
                </p>
              </div>
              <Play className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">
                  {tasks.filter(task => task.status === 'published').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Revisão</p>
                <p className="text-2xl font-bold text-orange-600">
                  {tasks.filter(task => task.status === 'review').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {statusColumns.map((column) => (
          <Card key={column.id} className={`${column.color} min-h-[500px]`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {column.title}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {getTasksForStatus(column.id).length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {getTasksForStatus(column.id).map((task) => (
                <Card 
                  key={task.id} 
                  className={`cursor-pointer hover:shadow-md transition-all border-l-4 ${getPriorityColor(task.priority)}`}
                >
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium leading-tight">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        {task.due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {new Date(task.due_date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {priorityLabels[task.priority as keyof typeof priorityLabels]}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {getTasksForStatus(column.id).length === 0 && (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <div className="text-center">
                    <Kanban className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Nenhuma tarefa</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md m-4">
            <CardHeader>
              <CardTitle>Nova Tarefa</CardTitle>
              <CardDescription>Adicione uma nova tarefa ao seu quadro Kanban</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Título da tarefa"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
              <Textarea
                placeholder="Descrição (opcional)"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
              <select
                className="w-full p-2 border rounded-md"
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: Number(e.target.value) })}
              >
                <option value={1}>Prioridade Crítica</option>
                <option value={2}>Prioridade Alta</option>
                <option value={3}>Prioridade Média</option>
                <option value={4}>Prioridade Baixa</option>
                <option value={5}>Prioridade Muito Baixa</option>
              </select>
              <Input
                type="date"
                placeholder="Data de entrega"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
              />
              <select
                className="w-full p-2 border rounded-md"
                value={newTask.campaign_id}
                onChange={(e) => setNewTask({ ...newTask, campaign_id: e.target.value })}
              >
                <option value="">Selecione uma campanha (opcional)</option>
                {campaigns.map(campaign => (
                  <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button onClick={createTask} className="flex-1">
                  Criar Tarefa
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