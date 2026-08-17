export default function BetaBadge() {
  return (
    <span
      className="inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold tracking-wider text-white uppercase"
      style={{
        backgroundColor: "#211F3D",
        borderColor: "rgba(91, 95, 224, 0.6)",
        boxShadow: "0 0 10px rgba(91, 95, 224, 0.5)",
      }}
    >
      Beta
    </span>
  );
}
