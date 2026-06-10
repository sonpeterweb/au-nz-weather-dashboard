export const hourlyWeatherResponse = {
  hourly: {
    time: [
      '2025-01-21T00:00',
      '2025-01-21T01:00',
      '2025-01-21T02:00',
      '2025-01-21T03:00',
    ],
    temperature_2m: [20, 21, 22, 23],
    precipitation: [0.5, 1.2, 0, 2.1],
    windspeed_10m: [12, 14, 16, 18],
  },
};

export const dailyWeatherResponse = {
  daily: {
    time: ['2025-01-21', '2025-01-22', '2025-01-23'],
    temperature_2m_max: [30, 32, 36],
    temperature_2m_min: [18, 20, 22],
    precipitation_sum: [5, 55, 10],
    windspeed_10m_max: [15, 30, 20],
  },
};
