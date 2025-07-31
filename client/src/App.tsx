import "./index.css";

import { lazy, Suspense } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "./components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import LoadingSpinner from "./components/LoadingSpinner";

const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Alerts = lazy(() => import("./pages/Alerts"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const GoogleAuthSuccess = lazy(() => import("./pages/GoogleAuthSuccess"));

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/profile" element={<Profile />} />
              <Route
                path="/google-auth-success/:token"
                element={<GoogleAuthSuccess />}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
