async function checkHealth() {
  const res = await fetch("server/api/health");
  if (!res.ok) throw new Error("Failed to check health");
  return res.json();
}

console.log(checkHealth());
