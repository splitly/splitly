import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, CreditCard, PieChart, Settings, Bell, Search, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/services/api";
import { toast } from "sonner";

export function AppLayout() {
  const { data: profile } = useProfile();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-secondary/20 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r border-border hidden md:flex flex-col">
        <div className="p-6">
          <Link to="/" className="text-2xl font-bold tracking-tighter text-primary">SplitX</Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link to="/dashboard">
            <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={isActive("/dashboard")} />
          </Link>
          <Link to="/expenses">
            <NavItem icon={<CreditCard size={20} />} label="Expenses" active={isActive("/expenses")} />
          </Link>
          <Link to="/activity">
            <NavItem icon={<Activity size={20} />} label="Activity" active={isActive("/activity")} />
          </Link>
          <Link to="/analytics">
            <NavItem icon={<PieChart size={20} />} label="Analytics" active={isActive("/analytics")} />
          </Link>
          <Link to="/settings">
            <NavItem icon={<Settings size={20} />} label="Settings" active={isActive("/settings")} />
          </Link>
        </nav>
        
        <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 text-center">
          <div className="h-10 w-10 mx-auto bg-primary rounded-full flex items-center justify-center mb-3">
             <span className="text-primary-foreground text-xs font-bold">PRO</span>
          </div>
          <p className="text-sm font-semibold mb-1">Upgrade to Premium</p>
          <p className="text-xs text-muted-foreground mb-3">Unlock AI features</p>
          <Button size="sm" className="w-full rounded-full" onClick={() => toast("Premium tier launching soon!")}>Upgrade</Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center gap-4 w-96">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search expenses, groups..." className="pl-10 rounded-full bg-secondary/50 border-none h-10" />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full relative" onClick={() => toast("No new notifications")}>
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive border-2 border-background"></span>
            </Button>
            <Link to="/settings">
              <Avatar className="h-10 w-10 border border-border cursor-pointer hover:border-primary transition-colors">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} />
                ) : (
                  <AvatarFallback>{profile?.first_name?.charAt(0) || 'U'}</AvatarFallback>
                )}
              </Avatar>
            </Link>
          </div>
        </header>

        {/* Scrollable Dashboard Area */}
        <div className="flex-1 overflow-auto p-8 no-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${active ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}
