import { NextResponse } from "next/server";
import { getFreshAccessToken } from "@/lib/connectors-auth";

export async function POST(request: Request) {
  try {
    const { accessToken: googleToken } = await getFreshAccessToken();

    if (!googleToken) {
      return NextResponse.json(
        { error: "Google not connected. Please connect Google first." },
        { status: 401 }
      );
    }

    const { days_ahead = 7, limit = 10 } = await request.json();

    // Calculate time range
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + days_ahead);

    const params = new URLSearchParams({
      timeMin: now.toISOString(),
      timeMax: future.toISOString(),
      maxResults: String(limit),
      singleEvents: "true",
      orderBy: "startTime",
    });

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      {
        headers: {
          Authorization: `Bearer ${googleToken}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Google token expired. Please reconnect Google." },
          { status: 401 }
        );
      }
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Google Calendar API error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    const events = (data.items || []).map((event: any) => ({
      id: event.id,
      title: event.summary || "(No title)",
      description: event.description || null,
      location: event.location || null,
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      all_day: !event.start?.dateTime,
      html_link: event.htmlLink,
    }));

    return NextResponse.json({
      events,
      total: events.length,
      days_ahead,
    });
  } catch (error) {
    console.error("calendar_list_events error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
