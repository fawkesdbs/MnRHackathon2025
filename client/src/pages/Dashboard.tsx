import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Plus, X, MapPin, AlertTriangle, Clock, Route } from "lucide-react";
import type { MonitoredDestination, Alert } from "../types/types";

export default function Dashboard() {
  const [currentLocation, setCurrentLocation] = useState(
    "Pretoria, South Africa"
  );
  const [newDestination, setNewDestination] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Mock data - in a real app, this would come from an API
  const [destinations, setDestinations] = useState<MonitoredDestination[]>([
    {
      id: "1",
      location: "Paris, France",
      risk_level: "Medium",
      last_checked: new Date(),
      user_id: "user1",
    },
    {
      id: "2",
      location: "London, UK",
      risk_level: "Low",
      last_checked: new Date(),
      user_id: "user1",
    },
    {
      id: "3",
      location: "Bangkok, Thailand",
      risk_level: "High",
      last_checked: new Date(),
      user_id: "user1",
    },
  ]);

  // Mock critical alerts
  const criticalAlerts: Alert[] = [
    {
      id: "1",
      title: "Flight BA56 Cancelled",
      type: "Route",
      severity: "Critical",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      associated_destination: "1",
    },
    {
      id: "2",
      title: "High protest activity near Eiffel Tower",
      type: "Destination",
      severity: "Critical",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      associated_destination: "1",
    },
    {
      id: "3",
      title: "Public transport strike scheduled",
      type: "Destination",
      severity: "Critical",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      associated_destination: "3",
    },
  ];

  const addDestination = () => {
    if (newDestination.trim()) {
      const newDest: MonitoredDestination = {
        id: Date.now().toString(),
        location: newDestination.trim(),
        risk_level: "Medium",
        last_checked: new Date(),
        user_id: "user1",
      };
      setDestinations([...destinations, newDest]);
      setNewDestination("");
      setIsAddDialogOpen(false);
    }
  };

  const removeDestination = (id: string) => {
    setDestinations(destinations.filter((dest) => dest.id !== id));
  };

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Trip Setup */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>Trip Setup</span>
                </CardTitle>
                <CardDescription>
                  Configure your travel plans and monitor destinations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Location */}
                <div className="space-y-2">
                  <Label
                    htmlFor="current-location"
                    className="text-sm font-medium"
                  >
                    My Current Location
                  </Label>
                  <Input
                    id="current-location"
                    value={currentLocation}
                    onChange={(e) => setCurrentLocation(e.target.value)}
                    className="border-gray-200 focus:border-primary focus:ring-primary"
                  />
                </div>

                {/* Destinations */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      My Destinations
                    </Label>
                    <Dialog
                      open={isAddDialogOpen}
                      onOpenChange={setIsAddDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Destination
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Destination</DialogTitle>
                          <DialogDescription>
                            Enter a destination you want to monitor for travel
                            risks.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="destination">Destination</Label>
                            <Input
                              id="destination"
                              placeholder="e.g., Tokyo, Japan"
                              value={newDestination}
                              onChange={(e) =>
                                setNewDestination(e.target.value)
                              }
                              onKeyPress={(e) =>
                                e.key === "Enter" && addDestination()
                              }
                            />
                          </div>
                          <div className="flex space-x-2">
                            <Button onClick={addDestination} className="flex-1">
                              Add
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setIsAddDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="space-y-2">
                    {destinations.map((destination) => (
                      <div
                        key={destination.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-900">
                            {destination.location}
                          </span>
                          <Badge
                            className={getRiskBadgeColor(
                              destination.risk_level
                            )}
                          >
                            {destination.risk_level}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeDestination(destination.id)}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {destinations.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No destinations added yet</p>
                        <p className="text-sm">
                          Click "Add Destination" to get started
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Analysis & Summary */}
          <div className="space-y-6">
            {/* Analyze Button */}
            <Card>
              <CardContent className="p-6">
                <Link to="/alerts">
                  <Button
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4"
                  >
                    <Route className="w-5 h-5 mr-2" />
                    Analyze Travel Routes
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Critical Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-critical" />
                  <span>Recent Critical Alerts</span>
                </CardTitle>
                <CardDescription>
                  Latest high-priority alerts for your destinations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {criticalAlerts.slice(0, 3).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <AlertTriangle className="w-4 h-4 text-critical mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {alert.title}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {alert.type}
                          </Badge>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTimeAgo(alert.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {criticalAlerts.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">
                        No critical alerts at the moment
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
