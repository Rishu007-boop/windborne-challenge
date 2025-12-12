export interface BalloonPosition {
  id: string;
  lat: number;
  lon: number;
  altitude: number;
  timestamp: Date;
  hour: number;
}

export const fetchBalloonData = async (): Promise<BalloonPosition[]> => {
  const allPositions: BalloonPosition[] = [];
  const now = new Date();
  
  for (let hour = 0; hour < 24; hour++) {
    try {
      const paddedHour = hour.toString().padStart(2, '0');
      const response = await fetch(
        `https://a.windbornesystems.com/treasure/${paddedHour}.json`,
        { signal: AbortSignal.timeout(5000) }
      );
      
      if (!response.ok) continue;
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        data.forEach((position, index) => {
          if (
            Array.isArray(position) &&
            position.length >= 3 &&
            typeof position[0] === 'number' &&
            typeof position[1] === 'number' &&
            typeof position[2] === 'number' &&
            !isNaN(position[0]) &&
            !isNaN(position[1]) &&
            !isNaN(position[2]) &&
            position[0] >= -90 &&
            position[0] <= 90 &&
            position[1] >= -180 &&
            position[1] <= 180
          ) {
            const timestamp = new Date(now.getTime() - hour * 60 * 60 * 1000);
            allPositions.push({
              id: `${hour}-${index}`,
              lat: position[0],
              lon: position[1],
              altitude: position[2],
              timestamp,
              hour
            });
          }
        });
      }
    } catch (error) {
      console.warn(`Failed to fetch hour ${hour}:`, error);
    }
  }
  
  return allPositions;
};
