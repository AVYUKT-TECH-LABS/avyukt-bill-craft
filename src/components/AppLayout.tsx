import { Outlet } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";

const navLinkClass =
  "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors";
const activeNavLinkClass = "text-foreground";

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="bg-background border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <nav className="flex items-center gap-6">
            <span className="font-bold text-foreground">Avyukt Bill Craft</span>
            <NavLink to="/" end className={navLinkClass} activeClassName={activeNavLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/clients" className={navLinkClass} activeClassName={activeNavLinkClass}>
              Clients
            </NavLink>
            <NavLink to="/settings" className={navLinkClass} activeClassName={activeNavLinkClass}>
              Settings
            </NavLink>
          </nav>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => supabase.auth.signOut()}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};
