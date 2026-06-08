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
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider opacity-60">
        Co-founders
      </span>
      {cofounders.map((cf) => {
        const name = [cf.first_name, cf.last_name].filter(Boolean).join(" ") || "Co-founder";
        const initials =
          (cf.first_name?.[0] ?? "").toUpperCase() + (cf.last_name?.[0] ?? "").toUpperCase();

        return (
          <button
            key={cf.link_id}
            type="button"
            onClick={() => onClickCofounder?.(cf.user_id)}
            className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2 py-1 text-[11px] font-medium backdrop-blur-sm transition hover:bg-white/20"
            title={name}
          >
            {cf.pfp_url ? (
              <Image
                src={cf.pfp_url}
                alt={name}
                width={16}
                height={16}
                className="h-4 w-4 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/30 text-[9px] font-bold">
                {initials}
              </span>
            )}
            <span className="max-w-[80px] truncate">{name}</span>
            {cf.title && (
              <span className="max-w-[60px] truncate opacity-70">{cf.title}</span>
            )}
            <span
              className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400"
              title="Linked"
            />
          </button>
        );
      })}
    </div>
  );
}
