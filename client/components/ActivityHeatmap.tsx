interface ActivityData {
  date: string;
  count: number;
}

interface ActivityHeatmapProps {
  activityByDate: ActivityData[];
}

export default function ActivityHeatmap({ activityByDate }: ActivityHeatmapProps) {
  const squares = activityByDate.slice(-365).map((activity) => {
    const intensity = Math.min(activity.count / 5, 1);
    const greenIntensity = Math.floor(intensity * 255);
    return (
      <div
        key={activity.date}
        className="w-3 h-3 rounded-sm"
        style={{
          backgroundColor: `rgb(34, ${197 + (greenIntensity / 255) * 58}, ${34 + greenIntensity})`,
        }}
        title={`${activity.date}: ${activity.count} submissions`}
      />
    );
  });

  return (
    <div className="flex flex-wrap gap-1 max-w-full">
      {squares}
    </div>
  );
}