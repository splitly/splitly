import { useAllExpenses } from "@/services/api";
import { Loader2, Activity as ActivityIcon } from "lucide-react";

export function Activity() {
  const { data: expenses, isLoading } = useAllExpenses();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Recent Activity</h1>
          <p className="text-muted-foreground">See what's happening across your groups.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[2rem] p-6 shadow-sm min-h-[400px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
          </div>
        ) : expenses?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center mb-4">
              <ActivityIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">No recent activity found.</p>
          </div>
        ) : (
          <div className="relative border-l border-border ml-6 space-y-8 pb-8">
            {expenses?.map((expense: any) => (
              <div key={expense.id} className="relative pl-8">
                <div className="absolute -left-[17px] top-1 h-8 w-8 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                  <ActivityIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-secondary/30 p-4 rounded-2xl border border-border/50">
                  <p className="text-sm text-muted-foreground mb-1">
                    {new Date(expense.created_at).toLocaleDateString()} at {new Date(expense.created_at).toLocaleTimeString()}
                  </p>
                  <p className="font-medium">
                    <span className="font-semibold text-foreground">{expense.profiles?.first_name}</span> added an expense <span className="font-semibold text-foreground">"{expense.title}"</span> in <span className="font-semibold text-foreground">{expense.groups?.name}</span>
                  </p>
                  <div className="mt-3 inline-block bg-background px-3 py-1.5 rounded-lg border border-border text-sm font-medium">
                    Amount: {expense.currency === 'INR' ? '₹' : '$'}{expense.amount}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
