import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");
    const apiKey = request.headers.get("X-Api-Key");

    if (!url) {
        return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    try {
        const headers: Record<string, string> = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept": "application/json"
        };

        if (apiKey) {
            headers["X-Api-Key"] = apiKey;
        }

        const response = await fetch(url, {
            headers: headers
        });

        const contentType = response.headers.get("content-type");
        let data;

        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            const text = await response.text();
            try {
                data = JSON.parse(text);
            } catch {
                // If not JSON, return as message
                data = {
                    status: "error",
                    message: text || `API returned ${response.status} ${response.statusText}`,
                    code: response.status
                };
            }
        }

        return NextResponse.json(data, { status: response.status });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        const msg = error?.message || "Failed to fetch data";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
