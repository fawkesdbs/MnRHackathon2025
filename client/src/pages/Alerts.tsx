import Navigation from "../components/Navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Clock, MapPin, Route } from "lucide-react";

export default function Alerts() {
  const trips = [
    {
      id: "1",
      from: "Pretoria, South Africa",
      to: "Paris, France",
      overallRisk: "High" as const,
      routeAlerts: [
        {
          id: "1",
          title: "Major delays on N1 Highway",
          type: "Route" as const,
          severity: "Medium" as const,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          associated_destination: "1",
        },
        {
          id: "2",
          title: "Flight BA56 Cancelled",
          type: "Route" as const,
          severity: "Critical" as const,
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          associated_destination: "1",
        },
      ],
      destinationAlerts: [
        {
          id: "3",
          title: "Public transport strike scheduled for July 30th",
          type: "Destination" as const,
          severity: "High" as const,
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
          associated_destination: "1",
        },
        {
          id: "4",
          title: "High protest activity near Eiffel Tower",
          type: "Destination" as const,
          severity: "Critical" as const,
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          associated_destination: "1",
        },
      ],
    },
    {
      id: "2",
      from: "Pretoria, South Africa",
      to: "London, UK",
      overallRisk: "Low" as const,
      routeAlerts: [
        {
          id: "5",
          title: "Minor construction delays on M25",
          type: "Route" as const,
          severity: "Low" as const,
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          associated_destination: "2",
        },
      ],
      destinationAlerts: [],
    },
    {
      id: "3",
      from: "Pretoria, South Africa",
      to: "Bangkok, Thailand",
      overallRisk: "Critical" as const,
      routeAlerts: [],
      destinationAlerts: [
        {
          id: "6",
          title: "Severe flooding in downtown area",
          type: "Destination" as const,
          severity: "Critical" as const,
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          associated_destination: "3",
        },
        {
          id: "7",
          title: "Political unrest near government buildings",
          type: "Destination" as const,
          severity: "High" as const,
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
          associated_destination: "3",
        },
      ],
    },
  ];

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

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return "Just now";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Travel Alerts Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor risks and alerts for all your planned trips
          </p>
        </div>

        <div className="space-y-6">
          {trips.map((trip) => (
            <Card key={trip.id} className="shadow-lg border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Trip: {trip.from} → {trip.to}
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
                          className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border"
                        >
                          <span className="text-lg mt-0.5">
                            {getSeverityIcon(alert.severity)}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {alert.title}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
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
                      <p className="text-sm">No route alerts for this trip</p>
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
                          className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border"
                        >
                          <span className="text-lg mt-0.5">
                            {getSeverityIcon(alert.severity)}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {alert.title}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
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
          ))}
        </div>
      </div>
    </div>
  );
}
