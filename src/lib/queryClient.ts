export async function apiRequest(
    method: string,
    url: string,
    data?: any
) {
    try {
        const res = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
            },
            body: data ? JSON.stringify(data) : undefined,
        });

        if (res.status === 204) return null;

        const contentType = res.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");

        if (!res.ok) {
            let errorMessage = `Server error: ${res.status}`;
            if (isJson) {
                const errorData = await res.json();
                errorMessage = errorData.message || errorMessage;
            } else {
                const textError = await res.text();
                if (textError && textError.length < 100) errorMessage = textError;
            }
            throw new Error(errorMessage);
        }

        if (isJson) {
            return res.json();
        }
        return null;
    } catch (error: any) {
        // If it's a network error or fetch failed (e.g. no backend)
        if (error.message === "Failed to fetch") {
            throw new Error("Could not connect to the server. Please ensure the backend is running.");
        }
        throw error;
    }
}
