export function getCurrentCohortLabel(date: Date = new Date()): string {
  const month = date.getMonth() + 1; // 1-12
  const year = date.getFullYear();

  let season: string;
  if (month >= 8) season = "Fall";
  else if (month >= 6) season = "Summer";
  else season = "Spring";

  return `${season} ${year} Cohort`;
}
