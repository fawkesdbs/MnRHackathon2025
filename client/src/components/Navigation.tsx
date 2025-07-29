import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Shield, MapPin, LogOut, BarChart3, User, Home } from "lucide-react";
import { cn } from "../lib/utils";

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // In a real app, you'd clear auth tokens here
    navigate("/login");
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/alerts", label: "Alerts", icon: BarChart3 },
    { path: "/profile", label: "Profile", icon: User },
  ];

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-warning rounded-full flex items-center justify-center">
                <MapPin className="w-2 h-2 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Travel Risk Analyzer
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    location.pathname === item.path
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Navigation */}
          <nav className="flex md:hidden space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    location.pathname === item.path
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 border-gray-200 text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
