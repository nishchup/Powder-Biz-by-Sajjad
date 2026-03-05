import React, { useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { useAppStore } from '../store';

interface ProductionChartsProps {
  startDate?: string;
  endDate?: string;
}

export const ProductionCharts: React.FC<ProductionChartsProps> = ({ startDate, endDate }) => {
  const { state } = useAppStore();

  const chartData = useMemo(() => {
    // Group conversions by date
    const grouped = state.conversions.reduce((acc: any, curr) => {
      const date = curr.date;
      
      // Apply filters if provided
      if (startDate && date < startDate) return acc;
      if (endDate && date > endDate) return acc;

      if (!acc[date]) {
        acc[date] = { date, wet: 0, dry: 0 };
      }
      acc[date].wet += curr.wetQuantityUsed || 0;
      acc[date].dry += curr.dryQuantityProduced || 0;
      return acc;
    }, {});

    // Convert to array and sort by date
    const result = Object.values(grouped).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // If no filters, show last 15 days
    if (!startDate && !endDate) {
      return result.slice(-15);
    }
    return result;
  }, [state.conversions, startDate, endDate]);

  const efficiencyData = useMemo(() => {
    return chartData.map((d: any) => ({
      date: d.date,
      efficiency: d.wet > 0 ? (d.dry / d.wet) * 100 : 0
    }));
  }, [chartData]);

  if (state.conversions.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 font-bold italic">
        No production data available for charts.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="space-y-6">
        <h3 className="text-xl font-black text-slate-900 flex items-center">
          <div className="w-2 h-6 bg-blue-500 rounded-full mr-3" />
          Production Trends
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorWet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDry" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                  padding: '12px'
                }}
                itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                labelStyle={{ fontWeight: 900, marginBottom: '4px', color: '#1e293b' }}
              />
              <Legend 
                verticalAlign="top" 
                align="right"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
              />
              <Area 
                type="monotone" 
                dataKey="wet" 
                name="Wet (kg)"
                stroke="#3b82f6" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorWet)" 
              />
              <Area 
                type="monotone" 
                dataKey="dry" 
                name="Dry (kg)"
                stroke="#f59e0b" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorDry)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-black text-slate-900 flex items-center">
          <div className="w-2 h-6 bg-emerald-500 rounded-full mr-3" />
          Conversion Efficiency
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={efficiencyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                unit="%"
              />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                  padding: '12px'
                }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Efficiency']}
                labelStyle={{ fontWeight: 900, marginBottom: '4px', color: '#1e293b' }}
              />
              <Bar dataKey="efficiency" radius={[6, 6, 0, 0]} barSize={32}>
                {efficiencyData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.efficiency > 80 ? '#10b981' : '#f59e0b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
