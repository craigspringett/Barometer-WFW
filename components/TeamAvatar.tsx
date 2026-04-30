"use client";

import { useState } from "react";
import type { TeamMember } from "@/lib/types";

interface Props {
  member: TeamMember;
  size?: number;
  ring?: boolean;
}

export function TeamAvatar({ member, size = 96, ring = true }: Props) {
  const [errored, setErrored] = useState(false);
  const initials = member.name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const ringCls = ring
    ? "ring-2 ring-white/20 ring-offset-2 ring-offset-transparent"
    : "";

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden ${ringCls}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 25%, ${member.accent}, #1B6A6C 90%)`,
      }}
    >
      {!errored && member.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={member.photo}
          alt={member.name}
          width={size}
          height={size}
          className="h-full w-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        <span
          className="font-display font-bold text-white"
          style={{ fontSize: size * 0.36 }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}
