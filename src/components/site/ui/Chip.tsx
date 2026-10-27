// Chip (spec §6, §14): a real checkbox or radio styled as a pill, so it is
// keyboard-operable and shows a checked state beyond colour alone.

type Props = {
  name: string;
  value: string;
  label: string;
  type?: "checkbox" | "radio";
  /** Fill when selected: ink (default) or lime. */
  selectedTone?: "ink" | "lime";
  defaultChecked?: boolean;
  disabled?: boolean;
};

export default function Chip({
  name,
  value,
  label,
  type = "checkbox",
  selectedTone = "ink",
  defaultChecked,
  disabled,
}: Props) {
  const checked =
    selectedTone === "lime"
      ? "has-checked:border-lime has-checked:bg-lime has-checked:text-ink"
      : "has-checked:border-ink has-checked:bg-ink has-checked:text-white";

  return (
    <label
      className={`inline-flex min-h-44 cursor-pointer items-center gap-8 rounded-pill lg:min-h-0 border border-rule-field bg-white px-14 py-11 text-text-strong type-chip has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-lime-deep ${checked}`}
    >
      <input
        type={type}
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        disabled={disabled}
        className="peer sr-only"
      />
      <span aria-hidden="true" className="hidden peer-checked:inline">
        ✓
      </span>
      {label}
    </label>
  );
}
