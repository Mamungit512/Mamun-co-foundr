"use client";

import Image from "next/image";
import { useCofounderLinks } from "./hooks";

type Props = {
  userId: string;
  onClickCofounder?: (userId: string) => void;
};

export default function CoFounderLinks({ userId, onClickCofounder }: Props) {
  const { data: cofounders, isLoading } = useCofounderLinks(userId);

  if (isLoading || !cofounders || cofounders.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ui-text-muted)]">
        Co-founders
      </span>
      <div className="flex flex-wrap gap-2">
        {cofounders.map((cf) => {
          const name = [cf.first_name, cf.last_name].filter(Boolean).join(" ") || "Co-founder";
          const initials =
            (cf.first_name?.[0] ?? "").toUpperCase() + (cf.last_name?.[0] ?? "").toUpperCase();

          return (
            <button
              key={cf.link_id}
              type="button"
              onClick={() => onClickCofounder?.(cf.user_id)}
              className="flex items-center gap-3 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-active)] px-3 py-2 text-left transition hover:border-[#bf5700] hover:bg-[#fff6f0] cursor-pointer"
              title={onClickCofounder ? `View ${name}'s profile` : name}
            >
              {cf.pfp_url ? (
                <Image
                  src={cf.pfp_url}
                  alt={name}
                  width={36}
                  height={36}
                  className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#bf5700]/20 text-sm font-bold text-[#a34800]">
                  {initials}
                </span>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-[var(--ui-text)]">{name}</span>
                  <span className="h-2 w-2 flex-shrink-0 rounded-full bg-green-400" title="Linked" />
                </div>
                {cf.title && (
                  <p className="mt-0.5 text-xs text-[var(--ui-text-muted)] truncate max-w-[140px]">
                    {cf.title}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
