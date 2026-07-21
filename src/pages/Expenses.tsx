import { useAllExpenses } from "@/services/api";
import { Loader2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function Expenses() {
  const { data: expenses, isLoading } = useAllExpenses();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">All Expenses</h1>
          <p className="text-muted-foreground">Every expense across all your groups.</p>
        </div>
        <Button className="rounded-full shadow-lg shadow-primary/25" onClick={() => navigate("/expense/new")}>
          <Receipt className="mr-2 h-4 w-4" /> Add Expense
        </Button>
      </div>

      <div className="bg-card border border-border rounded-[2rem] p-6 shadow-sm min-h-[400px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
          </div>
        ) : expenses?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center mb-4">
              <Receipt className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">You have no expenses yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {expenses?.map((expense: any) => (
              <div key={expense.id} className="flex justify-between items-center p-4 rounded-xl border border-border/50 hover:bg-secondary/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-lg">{expense.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Paid by {expense.profiles?.first_name} in {expense.groups?.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">{expense.currency === 'INR' ? '₹' : '$'}{expense.amount}</p>
                  <p className="text-xs text-muted-foreground">{new Date(expense.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
