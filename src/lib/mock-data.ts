import { subDays, format } from 'date-fns';

export const getAnalyticsData = () => {
  const now = new Date();
  const requestVolumeData = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(now, 29 - i);
    return {
      date: format(date, 'MMM d'),
      'Cygnis A1': Math.floor(Math.random() * (1500 - 500 + 1)) + 500,
      'Other AI': Math.floor(Math.random() * (1300 - 400 + 1)) + 400,
    };
  });

  const totalRequests = requestVolumeData.reduce(
    (acc, curr) => acc + curr['Cygnis A1'],
    0
  );

  const responseTimeData = [
    { label: '<1s', 'Cygnis A1': 65, 'Other AI': 50 },
    { label: '1-2s', 'Cygnis A1': 25, 'Other AI': 30 },
    { label: '2-5s', 'Cygnis A1': 8, 'Other AI': 15 },
    { label: '>5s', 'Cygnis A1': 2, 'Other AI': 5 },
  ];

  return {
    kpis: {
      totalRequests: totalRequests,
      avgResponseTime: 0.85,
      errorRate: 1.2,
      costPerRequest: 0.0015,
    },
    requestVolume: requestVolumeData,
    responseTimeDistribution: responseTimeData,
  };
};
