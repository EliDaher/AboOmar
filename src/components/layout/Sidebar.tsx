import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Home,
  Users,
  ChevronLeft,
  ChevronRight,
  WalletIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import DaherLogo from "../ui/logo";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home, allowed: ['admin'] },
  { name: "Customers", href: "/users", icon: Users },
  { name: "Balance", href: "/balance", icon: WalletIcon },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  const userStr = localStorage.getItem("DaherUser");
  const user = JSON.parse(userStr);

  return (
    <div
      className={cn(
        "relative flex h-full flex-col border-r bg-sidebar transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <DaherLogo className={'fill-transparent'}/>
            <span className="font-bold text-sidebar-foreground">
              AboOmar
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            item.allowed ? 
              item.allowed.includes(user.role) &&
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon
                  className={cn("h-5 w-5 flex-shrink-0", !isCollapsed && "mr-3")}
                />
                {!isCollapsed && item.name}
              </Link>
            :
              <Link
               key={item.name}
                to={item.href}
                className={cn(
                  "group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon
                 className={cn("h-5 w-5 flex-shrink-0", !isCollapsed && "mr-3")}
                />
                {!isCollapsed && item.name}
              </Link>
          );
        })}
      </nav>
    </div>
  );
}
