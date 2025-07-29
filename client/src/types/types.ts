export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  notify_on_risk_change: boolean;
  min_alert_level: "Medium" | "High" | "Critical";
  current_location: string;
}

export interface MonitoredDestination {
  id: string;
  location: string;
  risk_level: "Low" | "Medium" | "High" | "Critical";
  last_checked: Date;
  user_id: string;
}

export interface Alert {
  id: string;
  title: string;
  type: "Route" | "Destination";
  severity: "Low" | "Medium" | "High" | "Critical";
  timestamp: Date;
  associated_destination: string;
}

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";
export type AlertType = "Route" | "Destination";
