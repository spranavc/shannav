import { NavLink, useNavigate } from "react-router-dom";
import { CalendarDays, DollarSign, Lightbulb, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/app", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/app/itinerary", icon: CalendarDays, label: "Itinerary" },
  { to: "/app/budget", icon: DollarSign, label: "Budget" },
  { to: "/app/ideas", icon: Lightbulb, label: "Trip Ideas" },
];

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen w-full flex flex-col">

      {/* Top bar — always visible */}
      <header className="w-full bg-brand-600 flex items-center justify-between px-6 py-3 shrink-0">
        <NavLink to="/" className="text-xl font-bold text-white">
          Shannav
        </NavLink>

        {/* Desktop nav links */}
        <nav className="hidden sm:flex items-center gap-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-white/60">{user?.email}</span>
          {user && (
            <button
              onClick={handleLogout}
              className="text-white/60 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 w-full pb-16 sm:pb-0 overflow-y-auto">
        {children}
      </main>

      {/* Bottom nav — mobile only */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex w-full z-10">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs font-medium transition-colors",
                isActive ? "text-brand-600" : "text-slate-400"
              )
            }
          >
            <Icon className="w-6 h-6" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
