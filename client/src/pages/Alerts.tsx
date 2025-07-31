import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Clock, MapPin, Route, ShieldAlert, RefreshCw } from "lucide-react";
import { useToast } from "../components/ui/use-toast";
import type { Alert as AlertType } from "../types/types";
import { authFetch } from "../lib/authFetch";

interface TripAnalysis {
  id: string;
  from: string;
  to: string;
  overallRisk: "Low" | "Medium" | "High" | "Critical";
  routeAlerts: AlertType[];
  destinationAlerts: AlertType[];
}

const getUserIdFromToken = (): number | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id;
  } catch (e) {
    return null;
  }
};

export default function Alerts() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [analysisResults, setAnalysisResults] = useState<TripAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [startLocation] = useState(
    () => localStorage.getItem("currentLocation") || ""
  );

  const riskLevelMap: {
    [key: number]: "Low" | "Medium" | "High" | "Critical";
  } = {
    0: "Low",
    1: "Medium",
    2: "High",
    3: "Critical",
  };

  const fetchTripData = useCallback(
    async (isManualRefresh = false) => {
      const userId = getUserIdFromToken();
      const token = localStorage.getItem("token");

      if (!token || !userId) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please log in to view your alerts.",
        });
        navigate("/login");
        return;
      }

      setIsLoading(true);

      try {
        const response = await authFetch(
          `/server/api/alerts/user/${userId}/trips`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch trip data.");
        }

        const data: TripAnalysis[] = await response.json();
        const formattedData = data.map((trip) => ({
          ...trip,
          overallRisk:
            riskLevelMap[trip.overallRisk as unknown as number] || "Medium",
        }));

        setAnalysisResults(formattedData);

        if (isManualRefresh) {
          toast({
            variant: "success",
            title: "Success",
            description: "Alerts have been updated.",
          });
        }
      } catch (error) {
        console.error("Failed to fetch trip data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not retrieve your trip alerts.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, toast]
  );

  useEffect(() => {
    fetchTripData();
  }, [fetchTripData]);

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-success text-success-foreground";
      case "Medium":
        return "bg-warning text-warning-foreground";
      case "High":
        return "bg-orange-500 text-white";
      case "Critical":
        return "bg-critical text-critical-foreground";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "Low":
        return "🟢";
      case "Medium":
        return "🟡";
      case "High":
        return "🟠";
      case "Critical":
        return "🔴";
      default:
        return "⚪";
    }
  };

  const formatTimeAgo = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return "Just now";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray via-background to-gray">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Live Travel Analysis
            </h1>
            <p className="text-gray-600 mt-2">
              Showing real-time alerts for your trip from{" "}
              <span className="font-semibold">{startLocation}</span>
            </p>
          </div>
          <Button
            onClick={() => fetchTripData(true)}
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            {isLoading ? "Refreshing..." : "Refresh Alerts"}
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-gray-500">
            <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin text-gray-300" />
            <h2 className="text-xl font-semibold">Loading trips...</h2>
            <p>Please wait.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {analysisResults.length > 0 ? (
              analysisResults.map((trip) => (
                <Card key={trip.id} className="shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold text-gray-900">
                        Trip: {trip.to}
                      </CardTitle>
                      <Badge
                        className={`${getRiskBadgeColor(
                          trip.overallRisk
                        )} text-sm font-semibold px-3 py-1`}
                      >
                        {trip.overallRisk.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Route Alerts Section */}
                    <div>
                      <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                        🛣️ Route Alerts
                      </h3>
                      {trip.routeAlerts.length > 0 ? (
                        <div className="space-y-2">
                          {trip.routeAlerts.map((alert) => (
                            <div
                              key={alert.id}
                              className="flex items-start space-x-3 p-3 bg-gray rounded-lg border"
                            >
                              <span className="text-lg mt-0.5">
                                {getSeverityIcon(alert.severity)}
                              </span>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {alert.title}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {alert.severity}
                                  </Badge>
                                  <div className="flex items-center text-xs text-gray-500">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {formatTimeAgo(alert.timestamp)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <Route className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">
                            No route alerts for this trip
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Destination Alerts Section */}
                    <div>
                      <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                        🏙️ Destination Alerts
                      </h3>
                      {trip.destinationAlerts.length > 0 ? (
                        <div className="space-y-2">
                          {trip.destinationAlerts.map((alert) => (
                            <div
                              key={alert.id}
                              className="flex items-start space-x-3 p-3 bg-gray rounded-lg border"
                            >
                              <span className="text-lg mt-0.5">
                                {getSeverityIcon(alert.severity)}
                              </span>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {alert.title}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {alert.severity}
                                  </Badge>
                                  <div className="flex items-center text-xs text-gray-500">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {formatTimeAgo(alert.timestamp)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">
                            No destination alerts for this trip
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-16 text-gray-500">
                <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h2 className="text-xl font-semibold">No Trips to Display</h2>
                <p>Go to your dashboard to add a destination.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
