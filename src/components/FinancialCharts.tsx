import * as React from 'react';
import { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  LineChart,
  Line
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

  if (chartData.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-6 mt-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-6 text-gray-800">
          Financial Trends (Sales vs Purchases vs Expenses)
        </h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 12}}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 12}}
                tickFormatter={(value: number) => `৳${value.toLocaleString()}`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`৳${value.toLocaleString()}`, '']}
              />
              <Legend verticalAlign="top" height={36}/>
              <Bar dataKey="sales" name="Sales" fill="#10b981" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="purchases" name="Purchases" fill="#ef4444" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="expenses" name="Expenses" fill="#f59e0b" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
