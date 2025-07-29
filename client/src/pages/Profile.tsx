import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import { User, Lock, Bell, Save } from "lucide-react";

export default function Profile() {
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    minAlertLevel: "Medium",
    includeTrafficAlerts: true,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate save process
    setTimeout(() => {
      setIsLoading(false);
      // Reset password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    }, 1000);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            User Profile & Preferences
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings and alert preferences
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5 text-primary" />
              <span>Account Settings</span>
            </CardTitle>
            <CardDescription>
              Update your personal information and security settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <User className="w-4 h-4 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Personal Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="border-gray-200 focus:border-primary focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="border-gray-200 bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Security */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Lock className="w-4 h-4 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Security
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) =>
                        handleInputChange("currentPassword", e.target.value)
                      }
                      className="border-gray-200 focus:border-primary focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) =>
                          handleInputChange("newPassword", e.target.value)
                        }
                        className="border-gray-200 focus:border-primary focus:ring-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleInputChange("confirmPassword", e.target.value)
                        }
                        className="border-gray-200 focus:border-primary focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Alert Preferences */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Bell className="w-4 h-4 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Alert Preferences
                  </h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="min-alert-level">
                      Minimum risk level to notify me about
                    </Label>
                    <Select
                      value={formData.minAlertLevel}
                      onValueChange={(value) =>
                        handleInputChange("minAlertLevel", value)
                      }
                    >
                      <SelectTrigger className="w-full border-gray-200 focus:border-primary focus:ring-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label
                        htmlFor="traffic-alerts"
                        className="text-sm font-medium"
                      >
                        Include traffic alerts in my route analysis
                      </Label>
                      <p className="text-sm text-gray-500">
                        Get notified about traffic delays, road closures, and
                        construction
                      </p>
                    </div>
                    <Switch
                      id="traffic-alerts"
                      checked={formData.includeTrafficAlerts}
                      onCheckedChange={(checked) =>
                        handleInputChange("includeTrafficAlerts", checked)
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Save Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
                >
                  {isLoading ? (
                    "Saving Changes..."
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
