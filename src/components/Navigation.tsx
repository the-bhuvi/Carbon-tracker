import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Leaf, LayoutDashboard, FileInput, Users, LogOut, ClipboardList, GraduationCap, TreePine } from "lucide-react";
import { useAuth } from "./AuthContext";
import { Button } from "./ui/button";

const Navigation = () => {
  const location = useLocation();
  const { signOut, userRole } = useAuth();

  // Define navigation items based on role
  const getNavItems = () => {
    const baseItems = [
      { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { path: "/carbon-neutrality", icon: TreePine, label: "Carbon Neutrality" },
    ];

    if (userRole === 'admin') {
      return [
        ...baseItems,
        { path: "/admin/input", icon: FileInput, label: "Data Entry" },
        { path: "/admin/surveys", icon: ClipboardList, label: "Survey Management" },
      ];
    } else if (userRole === 'student') {
      return [
        ...baseItems,
        { path: "/student-survey", icon: Users, label: "Student Survey" },
      ];
    } else if (userRole === 'faculty') {
      return [
        ...baseItems,
        { path: "/faculty-survey", icon: GraduationCap, label: "Faculty Survey" },
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                Campus Carbon
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Footprint Tracker
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Sign Out</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navigation;

