
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export type ApiIncident = {
  id: number;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "resolved" | "closed";
  created_by: number;
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
};

export type IncidentListResponse = {
  items: ApiIncident[];
  total: number;
  skip: number;
  limit: number;
};

export async function login(username: string, password: string) {
  const body = new URLSearchParams({ username, password });

  const response = await fetch(
    `${API_BASE_URL}/api/v1/users/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    },
  );

  if (!response.ok) {
    throw new Error(`Login failed (${response.status}). Check credentials.`);
  }

  return response.json() as Promise<{
    access_token: string;
    token_type: string;
  }>;
}

export async function getIncidents(
  token: string,
  skip = 0,
  limit = 20,
): Promise<IncidentListResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/incidents/?skip=${skip}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Could not load incidents (${response.status}).`);
  }

  return response.json() as Promise<IncidentListResponse>;
}

export async function updateIncidentStatus(
  token: string,
  id: number,
  status: ApiIncident["status"],
): Promise<ApiIncident> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/incidents/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    },
  );

  if (!response.ok) {
    throw new Error(`Could not update incident (${response.status}).`);
  }

  return response.json() as Promise<ApiIncident>;
}


export type IncidentCreatePayload = {
  title: string;
  description: string;
  severity: ApiIncident["severity"];
};

export async function createIncident(
  token: string,
  incident: IncidentCreatePayload,
): Promise<ApiIncident> {
  const response = await fetch(`${API_BASE_URL}/api/v1/incidents/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(incident),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Could not create incident (${response.status}): ${errorBody}`,
    );
  }

  return response.json() as Promise<ApiIncident>;
}
