import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Target, 
  Calendar, 
  Users, 
  Settings, 
  Home,
  Zap,
  Briefcase,
  TrendingUp
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Estratégia", href: "/strategy", icon: Target },
  { name: "Campanhas", href: "/campaigns", icon: Zap },
  { name: "Personas", href: "/personas", icon: Users },
  { name: "Calendário", href: "/calendar", icon: Calendar },
  { name: "Projetos", href: "/projects", icon: Briefcase },
  { name: "Análise", href: "/analytics", icon: BarChart3 },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-8 border-b border-border">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-gradient">FlowMint</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                "hover:bg-primary-light hover:text-primary",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-glow" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-6 border-t border-border">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Settings className="w-5 h-5" />
          Configurações
        </Link>
      </div>
    </div>
  );
}