// API Configuration - Use environment variable with fallback
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

export async function GET(request: Request) {
  try {
    // Get authorization header from the request
    const authHeader = request.headers.get("Authorization");

    // Fetch stores from retail-sass customer API
    const response = await fetch(`${API_BASE_URL}/customer/stores`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
      },
    });

    if (!response.ok) {
      return Response.json(
        { error: `Failed to fetch stores: HTTP ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json({
      stores: data.stores || [],
      total: data.total || 0,
      source: "retail-sass-customer-api",
      message: "Stores fetched from retail-sass customer API",
    });
  } catch (error) {
    console.error("Error fetching stores:", error);
    return Response.json(
      {
        error: `Error fetching from retail-sass: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
