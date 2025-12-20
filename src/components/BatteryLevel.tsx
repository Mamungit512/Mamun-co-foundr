type BatteryLevelProps = {
  level: "Energized" | "Content" | "Burnt out";
};

export default function BatteryLevel({ level }: BatteryLevelProps) {
  const getBatteryConfig = () => {
    switch (level) {
      case "Energized":
        return {
          color: "bg-green-500",
          width: "100%",
          label: "Energized",
        };
      case "Content":
        return {
          color: "bg-yellow-400",
          width: "66%",
          label: "Content",
        };
      case "Burnt out":
        return {
          color: "bg-red-500",
          width: "25%",
          label: "Burnt out",
        };
      default:
        return {
          color: "bg-gray-400",
          width: "50%",
          label: "Unknown",
        };
    }
  };

  const config = getBatteryConfig();

  return (
    <div className="flex items-center gap-x-2">
      <div className="flex items-center gap-x-1">
        <div className="relative h-6 w-16 rounded border border-gray-400 bg-gray-100">
          <div
            className={`absolute top-0 left-0 h-full rounded-l ${config.color}`}
            style={{ width: config.width }}
          />
        </div>
        <div className="h-3 w-1 rounded-r-sm bg-gray-400" />
      </div>

      <span className="flex items-center gap-1 text-sm text-gray-700">
        <span>{config.label}</span>
      </span>
    </div>
  );
}
