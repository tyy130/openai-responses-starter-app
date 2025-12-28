export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");
    const unit = searchParams.get("unit");

    // 1. Get coordinates for the city
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location || "")}&format=json`,
      {
        headers: {
          "User-Agent": "GenTel-Assistant/1.0",
        },
      }
    );
    const geoData = await geoRes.json();

    if (!geoData || !geoData.length) {
      return new Response(JSON.stringify({ error: `Could not find location: ${location}` }), {
        status: 404,
      });
    }

    const { lat, lon } = geoData[0];

    // 2. Fetch weather data from Open-Meteo
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=${
        unit ?? "celsius"
      }`
    );

    if (!weatherRes.ok) {
      throw new Error("Weather service is temporarily unavailable");
    }

    const weather = await weatherRes.json();

    if (!weather.current_weather) {
      return new Response(
        JSON.stringify({ error: "Current weather data unavailable for this location" }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify({ 
      temperature: weather.current_weather.temperature,
      windspeed: weather.current_weather.windspeed,
      condition: weather.current_weather.weathercode, // You could map this to text if you want
      location: geoData[0].display_name
    }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error getting weather:", error);
    return new Response(JSON.stringify({ error: "Error getting weather" }), {
      status: 500,
    });
  }
}
