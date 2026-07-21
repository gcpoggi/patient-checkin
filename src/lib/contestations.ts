import type { Contestation, ContestationSummary } from "@/lib/types";

export function computeContestationSummary(list: Contestation[]): ContestationSummary {
  const won = list.filter((item) => item.status === "won").length;
  const lost = list.filter((item) => item.status === "lost").length;
  return {
    totalDemanded: list.reduce((sum, item) => sum + item.amountDemanded, 0),
    totalRecovered: list.reduce((sum, item) => sum + item.amountRecovered, 0),
    winRate: won + lost === 0 ? 0 : won / (won + lost),
    byStatus: {
      draft: list.filter((item) => item.status === "draft").length,
      submitted: list.filter((item) => item.status === "submitted").length,
      won,
      lost,
    },
  };
}
