import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useExpenseDetails, useUpdateExpense, useDeleteExpense } from "@/services/api";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function EditExpense() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: expense, isLoading } = useExpenseDetails(id || "");
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const [amountStr, setAmountStr] = useState("");
  const [title, setTitle] = useState("");
  const [paidBy, setPaidBy] = useState("");
  
  // Custom splits: { [userId]: amount }
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});

  useEffect(() => {
    if (expense) {
      setTitle(expense.title);
      setAmountStr(expense.amount.toString());
      setPaidBy(expense.paid_by);
      
      const initialSplits: Record<string, string> = {};
      expense.expense_splits.forEach((split: any) => {
        initialSplits[split.user_id] = split.amount.toString();
      });
      setCustomSplits(initialSplits);
    }
  }, [expense]);

  const amount = parseFloat(amountStr) || 0;
  const group = expense?.groups;
  const members = group?.group_members || [];

  const handleSplitChange = (userId: string, value: string) => {
    setCustomSplits(prev => ({ ...prev, [userId]: value }));
  };

  const handleSave = () => {
    if (!amount || !title || !id || !group) return;

    // Validate splits sum up to amount
    let totalSplit = 0;
    const splitData: { userId: string, amount: number }[] = [];
    
    Object.entries(customSplits).forEach(([userId, val]) => {
      const splitAmount = parseFloat(val) || 0;
      if (splitAmount > 0) {
        totalSplit += splitAmount;
        splitData.push({ userId, amount: splitAmount });
      }
    });

    if (Math.abs(totalSplit - amount) > 0.01) {
      toast.error("The split amounts must exactly equal the total expense amount.");
      return;
    }

    if (!paidBy) {
      toast.error("Please select who paid.");
      return;
    }

    updateExpense.mutate({
      expenseId: id,
      groupId: group.id,
      title,
      amount,
      paidBy,
      splits: splitData
    }, {
      onSuccess: () => {
        toast.success("Expense updated successfully");
        navigate(`/groups/${group.id}`);
      },
      onError: (err: any) => {
        toast.error(`Error updating expense: ${err.message}`);
      }
    });
  };

  const handleDelete = () => {
    if (!id || !group) return;
    if (confirm("Are you sure you want to permanently delete this expense?")) {
      deleteExpense.mutate(id, {
        onSuccess: () => {
          toast.success("Expense deleted");
          navigate(`/groups/${group.id}`);
        },
        onError: (err: any) => {
          toast.error(`Error deleting expense: ${err.message}`);
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!expense) return <div>Expense not found</div>;

  return (
    <div className="min-h-screen bg-secondary/20 flex flex-col">
      <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="rounded-full mr-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Edit expense</h1>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteExpense.isPending}>
          {deleteExpense.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
        </Button>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto p-6 flex flex-col gap-8">
        
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">What was this for?</label>
            <Input 
              type="text"
              placeholder="e.g. Dinner at Tandoori"
              className="text-2xl font-bold h-14 rounded-2xl border-none bg-secondary/50 focus-visible:ring-1 focus-visible:ring-primary/50 placeholder:text-muted-foreground/50 px-6"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Amount</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">₹</span>
              <Input 
                type="number"
                placeholder="0.00"
                className="text-3xl font-bold h-16 rounded-2xl border-none bg-secondary/50 focus-visible:ring-1 focus-visible:ring-primary/50 pl-14 placeholder:text-muted-foreground/30"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="font-semibold text-lg">Who paid?</h3>
          <div className="space-y-2">
            {members.map((m: any) => {
              const isSelected = paidBy === m.user_id;
              return (
                <div 
                  key={m.user_id}
                  onClick={() => setPaidBy(m.user_id)}
                  className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all ${isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-secondary/50 border border-transparent'}`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{m.profiles.first_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium flex-1">{m.profiles.first_name}</span>
                  {isSelected && <div className="h-3 w-3 rounded-full bg-primary" />}
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="font-semibold text-lg">How is it split?</h3>
          <p className="text-xs text-muted-foreground">Enter the exact amount each person owes. The total must equal the expense amount.</p>
          <div className="space-y-4">
            {members.map((m: any) => (
              <div key={m.user_id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{m.profiles.first_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{m.profiles.first_name}</span>
                </div>
                <div className="relative w-32">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">₹</span>
                  <Input 
                    type="number"
                    className="pl-7 rounded-xl h-9"
                    value={customSplits[m.user_id] || ""}
                    onChange={(e) => handleSplitChange(m.user_id, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-border mt-4">
            <span className="text-sm font-medium">Total Split</span>
            <span className={`font-bold ${Math.abs(Object.values(customSplits).reduce((sum, val) => sum + (parseFloat(val) || 0), 0) - amount) > 0.01 ? 'text-destructive' : 'text-emerald-500'}`}>
              ₹{Object.values(customSplits).reduce((sum, val) => sum + (parseFloat(val) || 0), 0).toFixed(2)} / ₹{amount.toFixed(2)}
            </span>
          </div>
        </div>

        <Button 
          className="w-full rounded-2xl h-14 text-base font-semibold shadow-xl shadow-primary/25 mb-10"
          onClick={handleSave}
          disabled={updateExpense.isPending}
        >
          {updateExpense.isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
          Save Changes
        </Button>

      </main>
    </div>
  );
}
