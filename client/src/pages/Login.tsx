import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { MapPin, Shield } from "lucide-react";
import GoogleIcon from "../components/GoogleIcon";
import { useToast } from "../components/ui/use-toast";
import { authFetch } from "../lib/authFetch";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true); // Clear previous errors

    try {
      const response = await authFetch("/server/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Login failed");
      }

      const data = await response.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        toast({
          variant: "success",
          title: "Login Successful",
          description: "Welcome back! Redirecting you to the dashboard.",
        });
        navigate("/dashboard");
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: (err as Error).message,
      });
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "/server/api/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray via-background to-gray px-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-gray/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-warning rounded-full flex items-center justify-center">
                <MapPin className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Travel Risk Analyzer
          </CardTitle>
          <CardDescription className="text-gray-600">
            Stay informed about travel risks and alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-gray-200 focus:border-primary focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-gray-200 focus:border-primary focus:ring-primary"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Login"}
            </Button>
            {/* <button onClick={handleGoogleLogin} className="w-full btn-secondary mt-4">Sign in with Google</button> */}
            <Button
              onClick={handleGoogleLogin}
              variant={"secondary"}
              className="w-full py-2.5 mt-2"
              disabled={isLoading}
            >
              <GoogleIcon className="w-5 h-5" />
              {isLoading ? "Signing in..." : "Sign in with Google"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-primary font-medium hover:text-primary/80 transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
