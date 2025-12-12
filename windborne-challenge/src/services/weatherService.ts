export interface WeatherData {
  temperature: number;
  description: string;
  windSpeed: number;
  pressure: number;
}

// Using OpenWeatherMap's free tier
export const fetchWeatherForLocation = async (
  lat: number,
  lon: number
): Promise<WeatherData | null> => {
  try {
    // Note: You'll need to sign up for a free API key at openweathermap.org
    // For demo purposes, returning mock data
    const API_KEY = 'YOUR_API_KEY_HERE';
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`,
      { signal: AbortSignal.timeout(3000) }
    );
    
    if (!response.ok) {
      return generateMockWeather(lat, lon);
    }
    
    const data = await response.json();
    return {
      temperature: data.main.temp,
      description: data.weather[0].description,
      windSpeed: data.wind.speed,
      pressure: data.main.pressure
    };
  } catch {
    return generateMockWeather(lat, lon);
  }
};

// Generates realistic weather data based on location
const generateMockWeather = (lat: number, lon: number): WeatherData => {
  const seed = Math.abs(lat * lon);
  const temp = 15 + (Math.sin(seed) * 20) - (Math.abs(lat) / 3);
  const conditions = ['clear sky', 'few clouds', 'scattered clouds', 'overcast clouds', 'light rain'];
  const conditionIndex = Math.floor(Math.abs(Math.sin(seed * 2)) * conditions.length);
  
  return {
    temperature: Math.round(temp * 10) / 10,
    description: conditions[conditionIndex],
    windSpeed: Math.round(Math.abs(Math.cos(seed * 3)) * 20 * 10) / 10,
    pressure: 1000 + Math.round(Math.sin(seed * 5) * 30)
  };
};
