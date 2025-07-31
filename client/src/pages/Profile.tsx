import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import { User, Lock, Bell, Save, Trash2, ShieldAlert } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { authFetch } from "../lib/authFetch";

export default function Profile() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    risk_threshold: "Medium",
    email_notifications: true,
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await authFetch("/server/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch user data.");

        const data = await response.json();
        console.log("Fetched user data:", data);

        const riskThresholdMap: { [key: number]: string } = {
          1: "Medium",
          2: "High",
          3: "Critical",
        };
        const riskThresholdStr =
          riskThresholdMap[data.risk_threshold] || "Medium";
        // --- CORRECTED: Set state with the new field names ---
        setFormData((prev) => ({
          ...prev,
          full_name: data.full_name || "",
          email: data.email,
          risk_threshold: riskThresholdStr || "Medium",
          email_notifications:
            data.email_notifications !== null ? data.email_notifications : true,
        }));
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load your profile data.",
        });
      }
    };
    fetchUserData();
  }, [toast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "New passwords do not match.",
      });
      return;
    }
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const payload = {
        full_name: formData.full_name,
        risk_threshold: formData.risk_threshold,
        email_notifications: formData.email_notifications,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      };

      const response = await authFetch("/server/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to update profile.");
      }

      toast({
        variant: "success",
        title: "Success!",
        description: "Your profile has been updated.",
      });
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDeleteProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await authFetch("/server/api/users/profile", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to delete profile.");
      }

      toast({
        variant: "success",
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray via-background to-gray">
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
                      value={formData.full_name}
                      onChange={(e) =>
                        handleInputChange("full_name", e.target.value)
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
                      className="border-gray-200 bg-gray text-gray-500"
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
                      value={formData.risk_threshold}
                      onValueChange={(value) =>
                        handleInputChange("risk_threshold", value)
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
                        htmlFor="email_notifications"
                        className="text-sm font-medium"
                      >
                        Enable Email Notifications
                      </Label>
                      <p className="text-sm text-gray-500">
                        Get notified about traffic delays, road closures, and
                        construction
                      </p>
                    </div>
                    <Switch
                      id="email_notifications"
                      checked={formData.email_notifications}
                      onCheckedChange={(checked) =>
                        handleInputChange("email_notifications", checked)
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
        <Card className="shadow-lg border-destructive mt-4 bg-danger">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-critical">
              <ShieldAlert className="w-5 h-5" />
              <span>Danger Zone</span>
            </CardTitle>
            <CardDescription className="text-critical">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete My Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action is permanent and cannot be undone. This will
                    permanently delete your account, profile, monitored
                    destinations, and alerts.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteProfile}>
                    Yes, Delete My Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
