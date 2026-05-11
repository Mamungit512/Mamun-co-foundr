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
];

function Card({ dept, featured }: { dept: Dept; featured?: boolean }) {
  return (
    <div
      className="relative overflow-hidden rounded-lg bg-white p-3"
      style={{
        border: featured ? `1.5px solid ${dept.accent}` : "0.5px solid #e8e4dc",
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
        style={{ color: "#9cadb7" }}
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
    </div>
  );
}

function TierHeader({ label, dotColor }: { label: string; dotColor: string }) {
  return (
    <div
      className="mb-3 flex items-center gap-2 border-b pb-2 text-[11px] font-semibold uppercase tracking-[0.08em]"
      style={{ borderColor: "#e8e4dc", color: "#9cadb7" }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: dotColor }}
      />
      {label}
    </div>
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
          style={{ color: "#9cadb7" }}
        >
          Founders from across every corner of UT Austin — 10 schools, one
          platform, one mission.
        </p>

        <TierHeader
          label="Tier 1 — Core Schools · Highest founder density"
          dotColor="#bf5700"
        />
        <div className="mb-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {TIER_1.map((d, i) => (
            <Card key={d.name} dept={d} featured={i === 0} />
          ))}
        </div>

        <TierHeader
          label="Tier 2 — Partner Schools · Strong secondary pipeline"
          dotColor="#9cadb7"
        />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {TIER_2.map((d) => (
            <Card key={d.name} dept={d} />
          ))}
        </div>
      </div>
    </section>
  );
}
