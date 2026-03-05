import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from 'recharts';
import { useAppStore } from '../store';

interface FinancialChartsProps {
  startDate?: string;
  endDate?: string;
}

export const FinancialCharts: React.FC<FinancialChartsProps> = ({ startDate, endDate }) => {
  const { state } = useAppStore();

  const chartData = useMemo(() => {
    const grouped: any = {};

    // Group sales
    state.sales.forEach(s => {
      if (startDate && s.date < startDate) return;
      if (endDate && s.date > endDate) return;
      if (!grouped[s.date]) grouped[s.date] = { date: s.date, sales: 0, purchases: 0, expenses: 0 };
      grouped[s.date].sales += s.totalRevenue;
    });

    // Group purchases
    state.purchases.forEach(p => {
      if (startDate && p.date < startDate) return;
      if (endDate && p.date > endDate) return;
      if (!grouped[p.date]) grouped[p.date] = { date: p.date, sales: 0, purchases: 0, expenses: 0 };
      grouped[p.date].purchases += p.totalCost;
    });

    // Group expenses
    state.expenses.forEach(e => {
      if (startDate && e.date < startDate) return;
      if (endDate && e.date > endDate) return;
      if (!grouped[e.date]) grouped[e.date] = { date: e.date, sales: 0, purchases: 0, expenses: 0 };
      grouped[e.date].expenses += e.amount;
    });

    const result = Object.values(grouped).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    if (!startDate && !endDate) {
      return result.slice(-15);
    }
    return result;
  }, [state.sales, state.purchases, state.expenses, startDate, endDate]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 font-bold italic">
        No financial data available for charts.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-black text-slate-900 flex items-center">
        <div className="w-2 h-6 bg-indigo-500 rounded-full mr-3" />
        Financial Performance
      </h3>
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
              formatter={(value: number) => `৳${value.toLocaleString()}`}
            />
            <Tooltip 
              cursor={{fill: '#f8fafc'}}
              contentStyle={{ 
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                padding: '12px'
              }}
              formatter={(value: number) => [`৳${value.toLocaleString()}`, '']}
              labelStyle={{ fontWeight: 900, marginBottom: '4px', color: '#1e293b' }}
            />
            <Legend 
              verticalAlign="top" 
              align="right"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            />
            <Bar dataKey="sales" name="Sales" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
            <Bar dataKey="purchases" name="Purchases" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={24} />
            <Bar dataKey="expenses" name="Expenses" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
