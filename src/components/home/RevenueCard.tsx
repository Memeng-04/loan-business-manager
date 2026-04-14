import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import Card from "../card/Card";
import styles from "./RevenueCard.module.css";

type RevenueChartDatum = {
  name: string;
  value: number;
};

type RevenueCardProps = {
  data: RevenueChartDatum[];
  totalRevenue: number;
};

const CHART_COLORS = ["#012A6A", "#1F3CA8", "#6DB6FE", "#93C5FD"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function RevenueCard({ data, totalRevenue }: RevenueCardProps) {
  return (
    <Card className={styles.card} variant="subtle" padding="lg">
      <div className={styles.headerRow}>
        <p className={styles.label}>Revenue Report by Frequency</p>
        <strong className={styles.totalLabel}>
          Total: {formatCurrency(totalRevenue)}
        </strong>
      </div>

      {totalRevenue <= 0 ? (
        <p className={styles.emptyText}>No loan revenue yet.</p>
      ) : (
        <div className={styles.chartLegendRow}>
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={96}
                  paddingAngle={2}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`${entry.name}-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => {
                    const numeric = typeof value === "number" ? value : 0;
                    return formatCurrency(numeric);
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className={styles.legendList}>
            {data.map((item, index) => (
              <li key={item.name} className={styles.legendItem}>
                <span
                  className={styles.legendDot}
                  style={{
                    backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                  }}
                />
                <span>{item.name}</span>
                <strong>{formatCurrency(item.value)}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
