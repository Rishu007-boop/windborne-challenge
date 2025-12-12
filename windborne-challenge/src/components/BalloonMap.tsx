import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { BalloonPosition, fetchBalloonData } from '../services/balloonService';
import { WeatherData, fetchWeatherForLocation } from '../services/weatherService';
import 'leaflet/dist/leaflet.css';
import './BalloonMap.css';

interface BalloonWithWeather extends BalloonPosition {
  weather?: WeatherData;
}

export const BalloonMap = () => {
  const [balloons, setBalloons] = useState<BalloonWithWeather[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const positions = await fetchBalloonData();
        
        if (positions.length === 0) {
          setError('No balloon data available');
          return;
        }

        // Sample 50 balloons to add weather data (to avoid too many API calls)
        const sampledBalloons = positions
          .sort(() => Math.random() - 0.5)
          .slice(0, 50);

        const balloonsWithWeather = await Promise.all(
          sampledBalloons.map(async (balloon) => {
            const weather = await fetchWeatherForLocation(balloon.lat, balloon.lon);
            return { ...balloon, weather: weather || undefined };
          })
        );

        setBalloons(balloonsWithWeather);
        setError(null);
      } catch (err) {
        setError('Failed to load balloon data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="loading">Loading balloon constellation data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="map-container">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {balloons.map((balloon) => {
          const color = balloon.altitude > 15 ? '#ff4444' : balloon.altitude > 10 ? '#ffaa00' : '#44ff44';
          
          return (
            <CircleMarker
              key={balloon.id}
              center={[balloon.lat, balloon.lon]}
              radius={6}
              fillColor={color}
              color="#fff"
              weight={1}
              opacity={0.8}
              fillOpacity={0.6}
            >
              <Popup>
                <div className="popup-content">
                  <h3>Balloon {balloon.id}</h3>
                  <p><strong>Position:</strong> {balloon.lat.toFixed(2)}°, {balloon.lon.toFixed(2)}°</p>
                  <p><strong>Altitude:</strong> {balloon.altitude.toFixed(1)} km</p>
                  <p><strong>Time:</strong> {balloon.hour}h ago</p>
                  {balloon.weather && (
                    <div className="weather-info">
                      <h4>Local Weather</h4>
                      <p><strong>Temp:</strong> {balloon.weather.temperature}°C</p>
                      <p><strong>Conditions:</strong> {balloon.weather.description}</p>
                      <p><strong>Wind:</strong> {balloon.weather.windSpeed} m/s</p>
                      <p><strong>Pressure:</strong> {balloon.weather.pressure} hPa</p>
                    </div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
      <div className="stats">
        <p>Tracking {balloons.length} balloons from the last 24 hours</p>
        <p className="legend">
          <span className="legend-item"><span className="dot red"></span> High altitude (&gt;15km)</span>
          <span className="legend-item"><span className="dot orange"></span> Medium altitude (10-15km)</span>
          <span className="legend-item"><span className="dot green"></span> Low altitude (&lt;10km)</span>
        </p>
      </div>
    </div>
  );
};
