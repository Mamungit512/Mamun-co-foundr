type BatteryLevelProps = {
  level: number; // value from 0 to 100
};

export default function BatteryLevel({ level }: BatteryLevelProps) {
  const getColor = () => {
    if (level > 75) return "bg-green-500";
    if (level > 50) return "bg-yellow-400";
    if (level > 25) return "bg-orange-400";
    return "bg-red-500";
  };

  return (
    <div className="flex items-center gap-x-2">
      <div className="flex items-center gap-x-1">
        <div className="relative h-6 w-16 rounded border border-gray-400 bg-gray-100">
          <div
            className={`absolute top-0 left-0 h-full rounded-l ${getColor()}`}
            style={{ width: `${level}%` }}
          />
        </div>
        <div className="h-3 w-1 rounded-r-sm bg-gray-400" />
      </div>

      <span className="text-sm text-gray-700">{level}%</span>
    </div>
  );
}
