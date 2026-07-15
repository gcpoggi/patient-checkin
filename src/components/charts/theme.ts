import { createElement } from "react";

export const CHART_COLORS = {
  teal: "#1B7EA6", sky: "#4FB4E6", navy: "#0D1B2A", noShow: "#64748B",
  paid: "#0E9F6E", pending: "#D97706", missing: "#DC2626", phantom: "#7C3AED",
} as const;

export const CHART_GRID = "#DCE9F2";
export const CHART_TEXT = "#475569";

interface ChartTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ color?: string; name?: string; value?: number | string }>;
  label?: string | number;
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return createElement("div", { className: "rounded-lg border border-mist-200 bg-white px-3 py-2 text-xs shadow-lg" },
    createElement("p", { className: "mb-1 font-semibold text-navy" }, label),
    ...payload.map((item, index) => createElement("p", { key: `${item.name}-${index}`, className: "font-mono tabular-nums", style: { color: item.color } }, `${item.name}: ${item.value}`)),
  );
}
