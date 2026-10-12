export type Student = {
  user_id: string;
  first_name: string;
  last_name: string;
  title: string | null;
  education: string | null;
  city: string;
  country: string;
  is_technical: boolean;
  created_at: string;
  deleted_at: string | null;
};

export function toHumanLabel(value: string | null): string | null {
  if (!value) return null;
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
