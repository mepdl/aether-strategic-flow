import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { User, Bell, Shield, Trash2, Database, Palette, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [isResetting, setIsResetting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [theme, setTheme] = useState("system");
  const [density, setDensity] = useState("comfortable");
  const [timezone, setTimezone] = useState("America/Cuiaba");
  const [preferences, setPreferences] = useState({
    name: "",
    email: "",
    jobTitle: "",
    company: "",
    bio: "",
    dateFormat: "DD/MM/YYYY"
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    weeklyReports: false,
    budgetAlerts: true,
    taskReminders: true
  });
  const { toast } = useToast();

  // Appearance helpers
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'system';
    const savedDensity = localStorage.getItem('density') || 'comfortable';
    const savedTimezone = localStorage.getItem('timezone') || timezone;
    const savedDateFormat = localStorage.getItem('dateFormat') || preferences.dateFormat;

    setTheme(savedTheme);
    setDensity(savedDensity);
    setTimezone(savedTimezone);
    setPreferences((prev) => ({ ...prev, dateFormat: savedDateFormat }));

    applyTheme(savedTheme);
    applyDensity(savedDensity);
  }, []);

  const applyTheme = (newTheme: string) => {
    const root = document.documentElement;
    root.classList.remove('dark');
    if (newTheme === 'dark') root.classList.add('dark');
    if (newTheme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) root.classList.add('dark');
    }
  };

  const applyDensity = (newDensity: string) => {
    const root = document.documentElement;
    root.classList.remove('density-compact', 'density-comfortable', 'density-spacious');
    if (newDensity !== 'comfortable') root.classList.add(`density-${newDensity}`);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const handleDensityChange = (newDensity: string) => {
    setDensity(newDensity);
    localStorage.setItem('density', newDensity);
    applyDensity(newDensity);
  };

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const fullName = (preferences.name || '').trim() || 'Usuário';
        // Upsert without unique constraint on user_id can fail. Do a safe select->update/insert flow.
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existing?.id) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ full_name: fullName })
            .eq('id', existing.id);
          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({ user_id: user.id, full_name: fullName });
          if (insertError) throw insertError;
        }
      }

      // Persist locally regardless of auth
      localStorage.setItem('profile:name', preferences.name);
      localStorage.setItem('profile:email', preferences.email);
      localStorage.setItem('profile:jobTitle', preferences.jobTitle);
      localStorage.setItem('profile:company', preferences.company);
      localStorage.setItem('profile:bio', preferences.bio);

      toast({ title: 'Preferências salvas', description: 'Suas informações foram atualizadas.' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Erro ao salvar', description: 'Tente novamente.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const saveWorkPreferences = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('timezone', timezone);
      localStorage.setItem('dateFormat', preferences.dateFormat);
      toast({ title: 'Preferências de trabalho salvas', description: 'Configurações aplicadas com sucesso.' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Erro ao salvar', description: 'Tente novamente.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const resetAllData = async () => {
    setIsResetting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // No auth: reset only local data to allow "começar do zero"
        ['theme','density','timezone','dateFormat','profile:name','profile:email','profile:jobTitle','profile:company','profile:bio'].forEach(k => localStorage.removeItem(k));
        toast({ title: 'Dados locais resetados', description: 'Preferências locais foram limpas. Para apagar dados do banco, faça login.' });
        return;
      }

      // Reset all user data in the correct order (children -> parents)
      const tables = [
        'metrics',
        'tasks',
        'content',
        'campaign_personas',
        'key_results',
        'campaigns',
        'objectives',
        'personas',
        'competitors',
        'swot_analysis',
        'brand_identity'
      ];

      for (const table of tables) {
        const { error } = await supabase
          .from(table as any)
          .delete()
          .eq('user_id', user.id);
        if (error) console.error(`Error deleting from ${table}:`, error);
      }

      toast({ title: 'Dados resetados com sucesso!', description: 'Todos os seus dados foram removidos.' });
    } catch (error) {
      console.error('Error resetting data:', error);
      toast({ title: 'Erro ao resetar dados', description: 'Tente novamente.', variant: 'destructive' });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">Gerencie suas preferências e configurações da conta</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Dados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>Atualize suas informações pessoais e de contato</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome Completo</label>
                  <Input 
                    placeholder="Seu nome completo" 
                    value={preferences.name}
                    onChange={(e) => setPreferences({ ...preferences, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input 
                    type="email" 
                    placeholder="seu@email.com" 
                    value={preferences.email}
                    onChange={(e) => setPreferences({ ...preferences, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cargo</label>
                  <Input 
                    placeholder="Seu cargo atual" 
                    value={preferences.jobTitle}
                    onChange={(e) => setPreferences({ ...preferences, jobTitle: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Empresa</label>
                  <Input 
                    placeholder="Nome da empresa" 
                    value={preferences.company}
                    onChange={(e) => setPreferences({ ...preferences, company: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bio</label>
                <Textarea 
                  placeholder="Conte-nos um pouco sobre você..." 
                  value={preferences.bio}
                  onChange={(e) => setPreferences({ ...preferences, bio: e.target.value })}
                />
              </div>
              <Button className="w-full md:w-auto" onClick={saveProfile} disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferências de Trabalho</CardTitle>
              <CardDescription>Configure suas preferências de fluxo de trabalho</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fuso Horário</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  >
                    <option value="UTC">UTC (GMT+0)</option>
                    <option value="Europe/Lisbon">Europe/Lisbon (GMT+0)</option>
                    <option value="Europe/Madrid">Europe/Madrid (GMT+1)</option>
                    <option value="America/Sao_Paulo">America/Sao_Paulo (GMT-3)</option>
                    <option value="America/Cuiaba">America/Cuiaba (GMT-4)</option>
                    <option value="America/New_York">America/New_York (GMT-5)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Formato de Data</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={preferences.dateFormat}
                    onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                  >
                    <option value="DD/MM/YYYY">DD/MM/AAAA</option>
                    <option value="MM/DD/YYYY">MM/DD/AAAA</option>
                    <option value="YYYY-MM-DD">AAAA-MM-DD</option>
                  </select>
                </div>
                <Button className="w-full md:w-auto" onClick={saveWorkPreferences} disabled={isSaving}>
                  {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>Controle quando e como você recebe notificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Notificações por Email</h4>
                    <p className="text-sm text-muted-foreground">Receba atualizações importantes por email</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle"
                    checked={notifications.emailNotifications}
                    onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Relatórios Semanais</h4>
                    <p className="text-sm text-muted-foreground">Resumo semanal das suas métricas</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle"
                    checked={notifications.weeklyReports}
                    onChange={(e) => setNotifications({ ...notifications, weeklyReports: e.target.checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Alertas de Orçamento</h4>
                    <p className="text-sm text-muted-foreground">Aviso quando atingir limites de orçamento</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle"
                    checked={notifications.budgetAlerts}
                    onChange={(e) => setNotifications({ ...notifications, budgetAlerts: e.target.checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Lembretes de Tarefas</h4>
                    <p className="text-sm text-muted-foreground">Notificações sobre prazos e entregas</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle"
                    checked={notifications.taskReminders}
                    onChange={(e) => setNotifications({ ...notifications, taskReminders: e.target.checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Segurança da Conta</CardTitle>
              <CardDescription>Gerencie a segurança e autenticação da sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Alterar Senha</h4>
                  <div className="space-y-2">
                    <Input type="password" placeholder="Senha atual" />
                    <Input type="password" placeholder="Nova senha" />
                    <Input type="password" placeholder="Confirmar nova senha" />
                    <Button variant="outline">Atualizar Senha</Button>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Autenticação de Dois Fatores</h4>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="text-sm">2FA está <Badge variant="destructive">Desativado</Badge></p>
                      <p className="text-xs text-muted-foreground">Adicione uma camada extra de segurança</p>
                    </div>
                    <Button variant="outline">Ativar 2FA</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personalização da Interface</CardTitle>
              <CardDescription>Customize a aparência da aplicação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Tema</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div 
                      className={`border rounded-lg p-3 text-center cursor-pointer ${theme === 'light' ? 'border-primary' : 'border-border'}`}
                      onClick={() => handleThemeChange('light')}
                    >
                      <div className="w-full h-12 bg-background border rounded mb-2"></div>
                      <p className="text-xs">Claro</p>
                    </div>
                    <div 
                      className={`border rounded-lg p-3 text-center cursor-pointer ${theme === 'dark' ? 'border-primary' : 'border-border'}`}
                      onClick={() => handleThemeChange('dark')}
                    >
                      <div className="w-full h-12 bg-gray-900 rounded mb-2"></div>
                      <p className="text-xs">Escuro</p>
                    </div>
                    <div 
                      className={`border rounded-lg p-3 text-center cursor-pointer ${theme === 'system' ? 'border-primary' : 'border-border'}`}
                      onClick={() => handleThemeChange('system')}
                    >
                      <div className="w-full h-12 bg-gradient-to-br from-background to-gray-900 rounded mb-2"></div>
                      <p className="text-xs">Sistema</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Densidade da Interface</h4>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={density}
                    onChange={(e) => handleDensityChange(e.target.value)}
                  >
                    <option value="comfortable">Confortável</option>
                    <option value="compact">Compacto</option>
                    <option value="spacious">Espaçoso</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Dados</CardTitle>
              <CardDescription>Controle seus dados e privacidade</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Exportar Dados</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Baixe uma cópia completa dos seus dados em formato JSON
                  </p>
                  <Button variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    Exportar Dados
                  </Button>
                </div>

                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <h4 className="text-sm font-medium mb-2 text-red-800">Zona de Perigo</h4>
                  <p className="text-sm text-red-700 mb-3">
                    As ações abaixo são irreversíveis. Proceda com cuidado.
                  </p>
                  
                  <div className="space-y-3">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Resetar Todos os Dados
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso irá deletar permanentemente todos os seus dados:
                            <br /><br />
                            • Todas as personas criadas<br />
                            • Todos os objetivos e resultados-chave<br />
                            • Todas as campanhas<br />
                            • Todo o calendário editorial<br />
                            • Todas as tarefas e projetos<br />
                            • Todas as métricas e análises<br />
                            • Análises SWOT e identidade da marca<br />
                            <br />
                            Você terá que começar completamente do zero.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={resetAllData}
                            disabled={isResetting}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {isResetting ? "Resetando..." : "Sim, resetar tudo"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <p className="text-xs text-red-600">
                      ⚠️ Esta ação remove todos os dados da aplicação permanentemente
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}