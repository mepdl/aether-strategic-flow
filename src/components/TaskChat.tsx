import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  comment: string;
  created_at: string;
  user_id: string;
  user_email?: string;
}

interface TaskChatProps {
  taskId: string;
  taskTitle: string;
}

export function TaskChat({ taskId, taskTitle }: TaskChatProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showChat, setShowChat] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (showChat) {
      fetchComments();
      setupRealtimeSubscription();
    }
  }, [showChat, taskId]);

  const fetchComments = async () => {
    try {
      const { data } = await supabase
        .from('task_comments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (data) {
        // Simple approach: just use user_id as display name for now
        const commentsWithUsers = data.map(comment => ({
          ...comment,
          user_email: `Usuário ${comment.user_id.slice(0, 8)}`
        }));
        
        setComments(commentsWithUsers);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`task_comments_${taskId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'task_comments',
        filter: `task_id=eq.${taskId}`
      }, (payload) => {
        const newComment = payload.new as Comment;
        setComments(prev => [...prev, newComment]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const sendComment = async () => {
    if (!newComment.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('task_comments')
      .insert({
        task_id: taskId,
        user_id: user.id,
        comment: newComment.trim()
      });

    if (error) {
      toast({
        title: 'Erro ao enviar comentário',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      setNewComment('');
      
      // Create notification for task owner
      const { data: task } = await supabase
        .from('tasks')
        .select('user_id, title')
        .eq('id', taskId)
        .single();

      if (task && task.user_id !== user.id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: task.user_id,
            title: 'Novo comentário na tarefa',
            message: `${user.email} comentou na tarefa "${taskTitle}"`,
            type: 'info'
          });
      }
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowChat(!showChat)}
        className="mb-2"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Chat da Tarefa
      </Button>

      {showChat && (
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Comentários - {taskTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-48 overflow-y-auto space-y-3">
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum comentário ainda
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">
                        {comment.user_email}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm">{comment.comment}</p>
                  </div>
                ))
              )}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Digite seu comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendComment()}
                className="flex-1"
              />
              <Button onClick={sendComment} size="sm">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}