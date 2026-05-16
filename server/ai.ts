import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export interface RouteData {
  id: string;
  summary: string;
  duration: string;
  distance: string;
  polyline: string;
  isRecommended: boolean;
  recommendationReason: string;
  chaosScore: number;
  trafficSeverity: 'Low' | 'Moderate' | 'Heavy' | 'Extreme';
}

export const getRouteSurvivalAdvice = async (origin: string, destination: string, mode: 'professional' | 'street' = 'street', reports: any[] = []) => {
  const apiKey = process.env.GOOGLE_MAPS_PLATFORM_KEY;
  
  // 1. Fetch real directions from Google Maps
  let googleRoutes: any[] = [];
  try {
    const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&alternatives=true&key=${apiKey}&traffic_model=best_guess&departure_time=now`;
    const directionsRes = await fetch(directionsUrl);
    const directionsData = await directionsRes.json();
    
    if (directionsData.status === 'OK') {
      googleRoutes = directionsData.routes;
    } else {
      console.warn("Google Maps Directions failed:", directionsData.status, directionsData.error_message);
      if (directionsData.status === 'REQUEST_DENIED') {
        throw new Error("DIRECTIONS_API_NOT_ENABLED: Ensure 'Directions API' is enabled in Google Cloud Console and your API key has no restrictions preventing its use.");
      }
      if (directionsData.status === 'ZERO_RESULTS') {
        throw new Error("NO_ROUTES_FOUND: No routes found between these locations.");
      }
    }
  } catch (error) {
    console.error("Error fetching directions:", error);
  }

  const systemInstruction = `
    You are "RouteWise AI", a premium urban survival intelligence platform for Nairobi.
    
    TONE & PERSONALITY:
    - Sharp, locally aware, and insightful.
    - Professional with "light" personality.
    - Mode: ${mode === 'professional' ? 'Direct, objective, and data-driven.' : 'Smart local, relatable but sharp.'}
    
    RESOURCES:
    - Current Nairobi time: ${new Date().toLocaleTimeString()}
    - Current Real-time Crowd Reports: ${JSON.stringify(reports.map(r => ({ type: r.type, desc: r.description })))}
    - Detected Routes from Google Maps: ${JSON.stringify(googleRoutes.map((r, i) => ({
        index: i,
        summary: r.summary,
        duration: r.legs[0].duration_in_traffic?.text || r.legs[0].duration.text,
        distance: r.legs[0].distance.text
      })))}
    
    TASK:
    1. Evaluate the provided routes.
    2. Determine which one is "best" not just by speed, but by avoiding the "chaos" (reports, known hotspots).
    3. For EACH route, provide:
       - A chaosScore (0-100).
       - trafficSeverity ('Low' | 'Moderate' | 'Heavy' | 'Extreme').
       - A recommendationReason (concise and insightful).
    4. Provide a global summary and street voice advice.
    
    Format your response as a JSON object:
    {
      "summary": string,
      "streetVoice": string,
      "routes": [
        {
          "index": number,
          "isRecommended": boolean,
          "recommendationReason": string,
          "chaosScore": number,
          "trafficSeverity": string
        }
      ],
      "localIntel": string[] (3-4 bullet points)
    }
  `;

  const prompt = `Route: ${origin} to ${destination}. Analyze for urban survival based on the detected directions.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const aiAnalysis = JSON.parse(response.text || "{}");
    
    // Merge AI analysis with Google's geometry
    const processedRoutes: RouteData[] = googleRoutes.map((r, i) => {
      const analysis = aiAnalysis.routes?.find((ar: any) => ar.index === i) || {};
      return {
        id: `route-${i}`,
        summary: r.summary || "Main Route",
        duration: r.legs[0].duration_in_traffic?.text || r.legs[0].duration.text,
        distance: r.legs[0].distance.text,
        polyline: r.overview_polyline.points,
        isRecommended: analysis.isRecommended || i === 0,
        recommendationReason: analysis.recommendationReason || "Fastest path according to baseline data.",
        chaosScore: analysis.chaosScore || 20,
        trafficSeverity: analysis.trafficSeverity || 'Low'
      };
    });

    return {
      summary: aiAnalysis.summary,
      streetVoice: aiAnalysis.streetVoice,
      localIntel: aiAnalysis.localIntel,
      routes: processedRoutes,
      chaosScore: processedRoutes.find(r => r.isRecommended)?.chaosScore || 50
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
