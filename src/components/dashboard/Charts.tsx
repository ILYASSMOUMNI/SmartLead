import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
const colors = ["#5965de", "#9499ef", "#bfc3f8", "#dce0fc", "#eaeafa"];
export function AcquisitionChart({
  points,
}: {
  points: { name: string; leads: number }[];
}) {
  return (
    <div
      className="chart-frame"
      role="img"
      aria-label={`Lead acquisition: ${points.map((p) => `${p.name}: ${p.leads}`).join(", ")}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={points}
          margin={{ top: 15, right: 15, left: -24, bottom: 0 }}
        >
          <defs>
            <linearGradient id="lead-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6470e8" stopOpacity={0.19} />
              <stop offset="100%" stopColor="#6470e8" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 4"
            vertical={false}
            stroke="#edf0f5"
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tickMargin={12}
            tick={{ fill: "#9297aa", fontSize: 11 }}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9297aa", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: "1px solid #eee",
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="leads"
            name="New leads"
            stroke="#6873e5"
            strokeWidth={2.5}
            fill="url(#lead-gradient)"
            activeDot={{ r: 5, stroke: "white", strokeWidth: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
export function SourceChart({
  points,
  total,
}: {
  points: { name: string; value: number }[];
  total: number;
}) {
  return (
    <div className="sources-content">
      <div
        className="donut-container"
        role="img"
        aria-label={points.map((p) => `${p.name}: ${p.value}`).join(", ")}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={points}
              dataKey="value"
              innerRadius="68%"
              outerRadius="90%"
              paddingAngle={4}
              cornerRadius={5}
              stroke="none"
              startAngle={90}
              endAngle={-270}
            >
              {points.map((p, i) => (
                <Cell key={p.name} fill={colors[i]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center">
          <strong>{total}</strong>
          <span>Total leads</span>
        </div>
      </div>
      <div className="source-legend">
        {points.map((p, i) => (
          <div key={p.name}>
            <span className="legend-square" style={{ background: colors[i] }} />
            <span>{p.name}</span>
            <strong>{p.value}</strong>
            <small>{total ? Math.round((p.value * 100) / total) : 0}%</small>
          </div>
        ))}
      </div>
    </div>
  );
}
export function ConversionChart({
  points,
}: {
  points: { name: string; rate: number }[];
}) {
  return (
    <div
      className="small-chart"
      role="img"
      aria-label={`Conversion by acquisition month: ${points.map((p) => `${p.name} ${p.rate}%`).join(", ")}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={points} margin={{ left: -27, right: 4, top: 10 }}>
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 4"
            stroke="#edf0f5"
          />
          <XAxis
            dataKey="name"
            tick={{ fill: "#9297aa", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `${v}%`}
            tick={{ fill: "#9297aa", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(v) => [`${v}%`, "Conversion rate"]}
            contentStyle={{ borderRadius: 10, fontSize: 12 }}
          />
          <Bar
            dataKey="rate"
            fill="#a7adf0"
            radius={[4, 4, 0, 0]}
            maxBarSize={22}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
