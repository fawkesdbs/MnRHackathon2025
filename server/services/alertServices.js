const getTrafficAlerts = async (start, destination, req) => {
  console.log(
    `Generating fake traffic alerts for route from ${start} to ${destination}`
  );
  // Return a predefined list of fake traffic alerts
  return [
    {
      id: `traffic_${new Date().getTime()}_1`,
      title: "Major congestion on the N1 highway near Midrand.",
      severity: "High",
      type: "Route",
      timestamp: new Date(),
    },
    {
      id: `traffic_${new Date().getTime()}_2`,
      title: "Road closure on M1 due to an earlier accident.",
      severity: "Critical",
      type: "Route",
      timestamp: new Date(new Date().setDate(new Date().getDate() - 1)), // 1 day old
    },
  ];
};

const getDestinationAlerts = async (destination, req) => {
  console.log(`Generating fake destination alerts for ${destination}`);
  // Return a predefined list of fake destination alerts
  return [
    {
      id: `dest_${new Date().getTime()}_1`,
      title: `Protest action reported in the CBD of ${destination}.`,
      severity: "Critical",
      type: "Destination",
      timestamp: new Date(),
    },
    {
      id: `dest_${new Date().getTime()}_2`,
      title: `Severe weather warning for ${destination}: Heavy rain expected.`,
      severity: "High",
      type: "Destination",
      timestamp: new Date(new Date().setDate(new Date().getDate() - 2)), // 2 days old
    },
    {
      id: `dest_${new Date().getTime()}_3`,
      title: `Water outage in some parts of ${destination}.`,
      severity: "Medium",
      type: "Destination",
      timestamp: new Date(new Date().setDate(new Date().getDate() - 8)), // 8 days old (will be filtered out)
    },
  ];
};

const updateHotspotAlerts = async (hotspot, req) => {
  console.log(
    `Simulating background alert update for hotspot: ${hotspot.location}`
  );
  // In a real scenario, you'd call the live APIs here.
  // For now, we'll use our fake data generators.
  const newAlerts = await getDestinationAlerts(hotspot.location, req);

  // Save these new alerts to the database, linked to the hotspot's ID.
  // The saveAlerts function in monitoredDestinationRoutes.js can be reused or adapted for this.
  console.log(
    `Generated ${newAlerts.length} new alerts for ${hotspot.location}`
  );
  return newAlerts;
};

module.exports = {
  getTrafficAlerts,
  getDestinationAlerts,
  updateHotspotAlerts,
};
