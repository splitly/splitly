import { useAllExpenses } from "@/services/api";
import { Loader2, PieChart as PieChartIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export function Analytics() {
  const { data: expenses, isLoading } = useAllExpenses();

  // Aggregate expenses by group name
  const dataMap = new Map();
  if (expenses) {
    expenses.forEach((exp: any) => {
      const groupName = exp.groups?.name || "Unknown";
      const current = dataMap.get(groupName) || 0;
      dataMap.set(groupName, current + Number(exp.amount));
    });
  }
  
  const data = Array.from(dataMap, ([name, value]) => ({ name, value }));

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Understand your spending habits.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-[2rem] p-6 shadow-sm min-h-[400px] flex flex-col">
          <h3 className="font-semibold text-lg mb-6">Spending by Group</h3>
          <div className="flex-1 flex justify-center items-center">
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
            ) : data.length === 0 ? (
              <div className="text-center">
                <PieChartIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Not enough data to show analytics.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`₹${value}`, 'Total Spent']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-[2rem] p-6 shadow-sm min-h-[400px] flex flex-col">
          <h3 className="font-semibold text-lg mb-6">Monthly Trend</h3>
          <div className="flex-1 flex justify-center items-center">
            <p className="text-muted-foreground text-sm">Line charts coming soon in the next update!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
