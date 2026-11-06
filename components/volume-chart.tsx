'use client';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, Tooltip, XAxis } from 'recharts';
export default function VolumeChart({ data }: { data: { label: string; volumen: number }[] }) {
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 0, right: 0, top: 12, bottom: 0 }}>
          <CartesianGrid stroke="var(--chart-grid)" vertical={false} strokeDasharray="2 6" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--muted)', fontSize: 11 }}
            dy={12}
          />
          <Tooltip
            cursor={{ fill: 'var(--panel-high)' }}
            contentStyle={{
              background: 'var(--glass-strong)',
              border: '1px solid var(--glass-border)',
              borderRadius: 14,
              color: 'var(--text)',
            }}
            formatter={(value) => [`${Number(value ?? 0).toLocaleString('es-PA')} kg·rep`, 'Volumen']}
          />
          <Bar
            dataKey="volumen"
            name="Volumen"
            radius={[5, 5, 0, 0]}
            fill="var(--chart-bar)"
            maxBarSize={38}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
