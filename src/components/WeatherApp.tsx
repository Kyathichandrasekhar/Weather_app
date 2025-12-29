import { useState } from "react";
import { Search, MapPin, Droplets, Wind, Thermometer, Cloud, Sun, CloudRain, CloudSnow, CloudLightning, CloudFog } from "lucide-react";

interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  description: string;
}

const getWeatherIcon = (condition: string) => {
  const iconClass = "w-24 h-24 text-weather-icon drop-shadow-lg";
  switch (condition.toLowerCase()) {
    case "clear":
      return <Sun className={iconClass} />;
    case "clouds":
      return <Cloud className={iconClass} />;
    case "rain":
    case "drizzle":
      return <CloudRain className={iconClass} />;
    case "snow":
      return <CloudSnow className={iconClass} />;
    case "thunderstorm":
      return <CloudLightning className={iconClass} />;
    case "mist":
    case "fog":
    case "haze":
      return <CloudFog className={iconClass} />;
    default:
      return <Sun className={iconClass} />;
  }
};

const WeatherApp = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async () => {
    if (!city.trim()) return;
    
    setLoading(true);
    setError("");
    
    try {
      // First get coordinates from city name using Open-Meteo Geocoding
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      );
      const geoData = await geoResponse.json();
      
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("City not found");
      }
      
      const { latitude, longitude, name, country } = geoData.results[0];
      
      // Then get weather data
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`
      );
      const weatherData = await weatherResponse.json();
      
      const current = weatherData.current;
      const weatherCode = current.weather_code;
      
      // Map weather codes to conditions
      let condition = "Clear";
      let description = "Clear sky";
      
      if (weatherCode === 0) {
        condition = "Clear";
        description = "Clear sky";
      } else if (weatherCode <= 3) {
        condition = "Clouds";
        description = "Partly cloudy";
      } else if (weatherCode <= 49) {
        condition = "Fog";
        description = "Foggy";
      } else if (weatherCode <= 69) {
        condition = "Rain";
        description = "Rainy";
      } else if (weatherCode <= 79) {
        condition = "Snow";
        description = "Snowy";
      } else if (weatherCode <= 99) {
        condition = "Thunderstorm";
        description = "Thunderstorm";
      }
      
      setWeather({
        city: name,
        country: country,
        temperature: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        condition,
        description,
      });
    } catch (err) {
      setError("Could not find weather for this city. Please try again.");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      fetchWeather();
    }
  };

  return (
    <div className="min-h-screen bg-weather-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Search Card */}
        <div className="glass-card rounded-3xl p-6 mb-6 animate-fade-in">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for a city..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-12 pr-4 py-4 bg-input/50 border border-border/50 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <button
              onClick={fetchWeather}
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {loading ? "..." : "Go"}
            </button>
          </div>
          {error && (
            <p className="mt-3 text-destructive text-sm text-center">{error}</p>
          )}
        </div>

        {/* Weather Display Card */}
        {weather && (
          <div className="glass-card rounded-3xl p-8 animate-fade-in-up">
            {/* Location */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">
                {weather.city}, {weather.country}
              </h2>
            </div>

            {/* Main Weather Display */}
            <div className="flex flex-col items-center mb-8">
              {getWeatherIcon(weather.condition)}
              <p className="text-7xl font-bold text-foreground mt-4">
                {weather.temperature}°
              </p>
              <p className="text-lg text-muted-foreground capitalize mt-2">
                {weather.description}
              </p>
            </div>

            {/* Weather Details */}
            <div className="grid grid-cols-3 gap-4">
              <div className="detail-card">
                <Thermometer className="w-6 h-6 text-accent-warm mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Feels Like</p>
                <p className="text-lg font-semibold text-foreground">{weather.feelsLike}°</p>
              </div>
              <div className="detail-card">
                <Droplets className="w-6 h-6 text-accent-cool mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Humidity</p>
                <p className="text-lg font-semibold text-foreground">{weather.humidity}%</p>
              </div>
              <div className="detail-card">
                <Wind className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Wind</p>
                <p className="text-lg font-semibold text-foreground">{weather.windSpeed} km/h</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!weather && !loading && (
          <div className="glass-card rounded-3xl p-12 text-center animate-fade-in">
            <Sun className="w-16 h-16 text-weather-icon mx-auto mb-4 animate-pulse-slow" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Check the Weather
            </h3>
            <p className="text-muted-foreground">
              Enter a city name to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherApp;
