"use client";

import { motion } from "framer-motion";

type Dept = {
  name: string;
  programs: string;
  chips: { label: string; bg: string; fg: string }[];
  accent: string;
};

const TIER_1: Dept[] = [
  {
    name: "McCombs Business",
    programs: "MBA · BBA · MPA · MFinance · MIS",
    accent: "#bf5700",
    chips: [
      { label: "B2B SaaS", bg: "#fdf0e8", fg: "#a04800" },
      { label: "Fintech", bg: "#fdf0e8", fg: "#a04800" },
    ],
  },
  {
    name: "Cockrell Engineering",
    programs: "CS · ECE · ME · Biomedical · ChE",
    accent: "#005f86",
    chips: [
      { label: "AI/ML", bg: "#e8f4fb", fg: "#005f86" },
      { label: "DeepTech", bg: "#e8f4fb", fg: "#005f86" },
    ],
  },
  {
    name: "School of Information",
    programs: "Data Science · UX · HCI · MIS",
    accent: "#00a9b7",
    chips: [
      { label: "Data", bg: "#e0f7f9", fg: "#007a85" },
      { label: "UX", bg: "#e0f7f9", fg: "#007a85" },
    ],
  },
  {
    name: "Natural Sciences",
    programs: "Biology · Chemistry · Neuroscience",
    accent: "#579d42",
    chips: [
      { label: "HealthTech", bg: "#eaf3de", fg: "#2d6e1a" },
      { label: "BioTech", bg: "#eaf3de", fg: "#2d6e1a" },
    ],
  },
  {
    name: "Liberal Arts",
    programs: "Economics · Government · Plan II",
    accent: "#f8971f",
    chips: [
      { label: "Policy", bg: "#fff3e0", fg: "#b36200" },
      { label: "Impact", bg: "#fff3e0", fg: "#b36200" },
    ],
  },
];

const TIER_2: Dept[] = [
  {
    name: "Moody Communication",
    programs: "Journalism · Advertising · PR · RTF",
    accent: "#a6cd57",
    chips: [
      { label: "Media", bg: "#f3f9e8", fg: "#4a7a10" },
      { label: "Consumer", bg: "#f3f9e8", fg: "#4a7a10" },
    ],
  },
  {
    name: "College of Fine Arts",
    programs: "Design · Studio Art · Music · Theatre",
    accent: "#ffd600",
    chips: [
      { label: "EdTech", bg: "#fffde0", fg: "#7a6a00" },
      { label: "Consumer", bg: "#fffde0", fg: "#7a6a00" },
    ],
  },
  {
    name: "School of Architecture",
    programs: "BArch · MArch · Urban Design",
    accent: "#333f48",
    chips: [
      { label: "PropTech", bg: "#eaecee", fg: "#333f48" },
      { label: "CleanTech", bg: "#eaecee", fg: "#333f48" },
    ],
  },
  {
    name: "LBJ Public Affairs",
    programs: "MPAff · Global Policy · JD/MPAff",
    accent: "#9cadb7",
    chips: [
      { label: "GovTech", bg: "#edf1f3", fg: "#3a5a6a" },
      { label: "Impact", bg: "#edf1f3", fg: "#3a5a6a" },
    ],
  },
  {
    name: "Dell Medical School",
    programs: "MD · MD/PhD · Health Innovation",
    accent: "#c0392b",
    chips: [
      { label: "HealthTech", bg: "#fdecea", fg: "#922b21" },
      { label: "BioTech", bg: "#fdecea", fg: "#922b21" },
    ],
  },
  {
    name: "Jackson Geosciences",
    programs: "Geo Sciences · Env Sci · Energy & Earth Resources",
    accent: "#ca8a04",
    chips: [
      { label: "CleanTech", bg: "#fdf6e3", fg: "#a16207" },
      { label: "DeepTech", bg: "#fdf6e3", fg: "#a16207" },
    ],
  },
  {
    name: "Civic Leadership",
    programs: "BS Civic Leadership",
    accent: "#4b3f8f",
    chips: [
      { label: "Policy", bg: "#eeecf9", fg: "#4b3f8f" },
      { label: "GovTech", bg: "#eeecf9", fg: "#4b3f8f" },
    ],
  },
  {
    name: "Education",
    programs: "Applied Learning · STEM Ed · Youth & Community Studies",
    accent: "#0f766e",
    chips: [
      { label: "EdTech", bg: "#e6f4f3", fg: "#0f766e" },
      { label: "Impact", bg: "#e6f4f3", fg: "#0f766e" },
    ],
  },
  {
    name: "Nursing",
    programs: "BSN · MSN · DNP",
    accent: "#059669",
    chips: [
      { label: "HealthTech", bg: "#e5f5ef", fg: "#059669" },
      { label: "BioTech", bg: "#e5f5ef", fg: "#059669" },
    ],
  },
  {
    name: "Pharmacy",
    programs: "PharmD · Pharmaceutical Sciences",
    accent: "#7c3aed",
    chips: [
      { label: "HealthTech", bg: "#f1eafd", fg: "#7c3aed" },
      { label: "BioTech", bg: "#f1eafd", fg: "#7c3aed" },
    ],
  },
  {
    name: "Social Work",
    programs: "BSW · MSSW",
    accent: "#65a30d",
    chips: [
      { label: "Impact", bg: "#f0f6e3", fg: "#65a30d" },
      { label: "Policy", bg: "#f0f6e3", fg: "#65a30d" },
    ],
  },
  {
    name: "Law",
    programs: "JD · LLM",
    accent: "#57534e",
    chips: [
      { label: "Policy", bg: "#eeece9", fg: "#57534e" },
      { label: "GovTech", bg: "#eeece9", fg: "#57534e" },
    ],
  },
  {
    name: "Pre-Med, Pre-Law & Teaching",
    programs: "Pre-Med · Pre-Law · Pre-Teaching",
    accent: "#0284c7",
    chips: [
      { label: "HealthTech", bg: "#e5f3fb", fg: "#0284c7" },
      { label: "EdTech", bg: "#e5f3fb", fg: "#0284c7" },
    ],
  },
];

function Card({ dept }: { dept: Dept }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.06, y: -6 }}
      whileTap={{ scale: 0.94 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 12,
        mass: 0.8,
      }}
      viewport={{ once: true, margin: "-50px" }}
      className="relative overflow-hidden rounded-lg bg-white p-3 cursor-pointer"
      style={{
        border: "0.5px solid #e8e4dc",
      }}
    >
      <div
        className="absolute left-0 top-0 h-full w-[3px]"
        style={{ backgroundColor: dept.accent }}
      />
      <div
        className="mb-1 pl-1 text-xs font-semibold leading-tight"
        style={{ color: "#333f48" }}
      >
        {dept.name}
      </div>
      <div
        className="mb-2 pl-1 text-[11px]"
        style={{ color: "#5f7280" }}
      >
        {dept.programs}
      </div>
      <div className="flex flex-wrap gap-1 pl-1">
        {dept.chips.map((c) => (
          <span
            key={c.label}
            className="rounded-sm px-1.5 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: c.bg, color: c.fg }}
          >
            {c.label}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export default function DepartmentMosaic() {
  return (
    <section
      id="departments"
      className="px-6 py-20"
      style={{ backgroundColor: "#ffffff" }}
    >
      <div className="mx-auto max-w-6xl">
        <h2
          className="mb-1.5 text-center text-2xl font-semibold sm:text-3xl"
          style={{ color: "#333f48" }}
        >
          Who&apos;s building here
        </h2>
        <p
          className="mb-10 text-center text-sm"
          style={{ color: "#5f7280" }}
        >
          Founders from across every corner of the University of Texas — 18 schools, one
          platform, one mission.
        </p>

        <div className="mb-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {TIER_1.map((d) => (
            <Card key={d.name} dept={d} />
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {TIER_2.map((d) => (
            <Card key={d.name} dept={d} />
          ))}
        </div>
      </div>
    </section>
  );
}
