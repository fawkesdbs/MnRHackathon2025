import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Shield,
  MapPin,
  LogOut,
  BarChart3,
  User,
  Home,
  Menu,
} from "lucide-react";
import { cn } from "../lib/utils";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { useState } from "react";

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/alerts", label: "Alerts", icon: BarChart3 },
    { path: "/profile", label: "Profile", icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-gray-200 shadow-sm">
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
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-2">
            {/* Right side controls */}
            <div className="hidden md:flex items-center space-x-2">
              <ThemeSwitcher />
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 hover:border-critical hover:text-critical"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>

            {/* Hamburger Menu */}
            <div className="md:hidden">
              <Button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                variant="ghost"
                size="icon"
              >
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute right-0 w-1/2 md:hidden bg-background dark:bg-gray-950 border-t border-l border-b border-gray-200 dark:border-gray-800 rounded-b-lg shadow-lg">
          <nav className="flex flex-col space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mt-4 flex items-center justify-between">
              <ThemeSwitcher />
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 hover:border-critical hover:text-critical"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
