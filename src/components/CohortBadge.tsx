import { getCurrentCohortLabel } from "@/lib/cohort";

export default function CohortBadge() {
  return (
    <span
      className="inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-[10px] font-bold tracking-wide text-white uppercase"
      style={{
        backgroundColor: "#211F3D",
        borderColor: "rgba(91, 95, 224, 0.6)",
        boxShadow: "0 0 10px rgba(91, 95, 224, 0.5)",
      }}
    >
      {getCurrentCohortLabel()}
    </span>
  );
}
