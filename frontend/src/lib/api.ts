export interface HealthResponse {
  status: string;
  database: "up" | "down" | string;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const response = await fetch(`${baseUrl}/api/v1/health`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Failed to retrieve health status`);
  }

  return response.json();
}
