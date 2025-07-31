import { Shield, MapPin } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-gradient-to-br from-gray via-background to-gray">
      {/* Spinner */}
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent border-b-transparent"></div>

      {/* Logo and Name at the bottom */}
      <div className="absolute bottom-10 gap-2 flex items-center space-y-2">
        <div className="relative">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-warning">
            <MapPin className="h-3 w-3 text-white" />
          </div>
        </div>
        <span className="text-lg font-bold text-foreground">
          Travel Risk Analyzer
        </span>
      </div>
    </div>
  );
}
