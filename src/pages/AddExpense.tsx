import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Sparkles, Image as ImageIcon, Check, Calendar, MapPin, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useGroupDetails, useAddExpense, useProfile } from "@/services/api";
import { toast } from "sonner";

export function AddExpense() {
  const navigate = useNavigate();
  const location = useLocation();
  const groupId = new URLSearchParams(location.search).get("group_id") || "";
  
  const [activeMode, setActiveMode] = useState("manual"); // manual, ai, receipt
  
  const { data: profile } = useProfile();
  const { data: group, isLoading } = useGroupDetails(groupId);
  const addExpense = useAddExpense();

  const [amountStr, setAmountStr] = useState("");
  const [title, setTitle] = useState("");

  const amount = parseFloat(amountStr) || 0;

  // Split equally among all members
  const splits = useMemo(() => {
    if (!group?.group_members || group.group_members.length === 0) return [];
    
    const splitAmount = amount / group.group_members.length;
    return group.group_members.map((m: any) => ({
      userId: m.user_id,
      amount: splitAmount,
      profile: m.profiles
    }));
  }, [amount, group?.group_members]);

  const handleSave = () => {
    if (!amount || !title || !groupId || !profile?.id) return;

    const splitData = splits.map((s: any) => ({ userId: s.userId, amount: s.amount }));

    addExpense.mutate({
      groupId,
      title,
      amount,
      paidBy: profile.id,
      splits: splitData
    }, {
      onSuccess: () => {
        navigate(`/groups/${groupId}`);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20 flex flex-col">
      {/* Header */}
      <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center px-6 sticky top-0 z-50">
        <Button variant="ghost" size="icon" className="rounded-full mr-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Add new expense to {group?.name}</h1>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-10 flex flex-col md:flex-row gap-10">
        
        {/* Left Side: Modes & AI */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="bg-card border border-border rounded-3xl p-2 flex flex-col gap-2 shadow-sm">
            <ModeButton 
               active={activeMode === 'manual'} 
               onClick={() => setActiveMode('manual')}
               title="Manual Entry" 
               desc="Type it out yourself" 
               icon={<div className="h-4 w-4 rounded-full bg-primary" />} 
            />
            <ModeButton 
               active={activeMode === 'ai'} 
               onClick={() => setActiveMode('ai')}
               title="Ask AI" 
               desc="Just describe the expense" 
               icon={<Sparkles className="h-4 w-4 text-amber-500" />} 
            />
            <ModeButton 
               active={activeMode === 'receipt'} 
               onClick={() => setActiveMode('receipt')}
               title="Scan Receipt" 
               desc="AI parses the items" 
               icon={<ImageIcon className="h-4 w-4 text-emerald-500" />} 
            />
          </div>

          {activeMode === 'ai' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl">
              <Sparkles className="h-6 w-6 text-primary mb-4" />
              <h3 className="font-medium mb-2">Natural Language Magic</h3>
              <p className="text-sm text-muted-foreground mb-4">Try saying something like: "I paid ₹1400 for dinner at Nobu with Sarah and Mike"</p>
              <textarea 
                className="w-full bg-background border border-border rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-24" 
                placeholder="Describe what happened..."
              ></textarea>
              <Button className="w-full rounded-full mt-4 bg-primary text-primary-foreground shadow-md shadow-primary/20" onClick={() => toast("AI parsing is a Premium feature!")}>Parse Expense</Button>
            </motion.div>
          )}

          {activeMode === 'receipt' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-secondary/30 transition-colors" onClick={() => toast("Receipt scanning is a Premium feature!")}>
              <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-1">Upload Receipt</h3>
              <p className="text-sm text-muted-foreground">PNG, JPG or PDF</p>
            </motion.div>
          )}
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 bg-card border border-border rounded-[2.5rem] p-8 md:p-10 shadow-sm relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none"></div>

          <div className="space-y-8 relative z-10">
            {/* Amount & Title */}
            <div>
               <p className="text-sm font-medium text-muted-foreground mb-2">Amount</p>
               <div className="flex items-center text-5xl md:text-6xl font-bold tracking-tighter text-foreground border-b border-border/50 pb-4">
                 <span className="text-muted-foreground/50 mr-2">₹</span>
                 <input 
                    type="number" 
                    placeholder="0.00" 
                    className="bg-transparent border-none outline-none w-full placeholder:text-muted-foreground/30" 
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                 />
               </div>
            </div>

            <div>
               <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
               <input 
                  type="text" 
                  placeholder="What was this for?" 
                  className="w-full text-xl font-medium bg-transparent border-none outline-none placeholder:text-muted-foreground/50" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
               />
            </div>

            <div className="flex flex-wrap gap-3">
               <Button variant="outline" size="sm" className="rounded-full bg-secondary/50 border-none hover:bg-secondary" onClick={() => toast("Date picker coming soon")}><Calendar className="mr-2 h-4 w-4" /> Today</Button>
               <Button variant="outline" size="sm" className="rounded-full bg-secondary/50 border-none hover:bg-secondary" onClick={() => toast("Location picker coming soon")}><MapPin className="mr-2 h-4 w-4" /> Location</Button>
               <Button variant="outline" size="sm" className="rounded-full bg-secondary/50 border-none hover:bg-secondary" onClick={() => toast("Categories coming soon")}><Tag className="mr-2 h-4 w-4" /> Category</Button>
            </div>

            {/* Split Details */}
            <div className="pt-6 border-t border-border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Paid by you</h3>
                <span className="text-sm text-primary font-medium cursor-pointer" onClick={() => toast("Changing payer coming soon")}>Change payer</span>
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold">Split equally ({splits.length} people)</h3>
                <span className="text-sm text-primary font-medium cursor-pointer" onClick={() => toast("Custom splits coming soon")}>Change split</span>
              </div>

              <div className="space-y-3">
                {splits.map((s: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={s.profile?.avatar_url || ""} />
                        <AvatarFallback>{s.profile?.first_name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{s.userId === profile?.id ? "You" : s.profile?.first_name}</span>
                    </div>
                    <span className="font-mono bg-secondary/50 px-3 py-1 rounded-md">₹{s.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button 
               size="lg" 
               className="w-full rounded-full h-14 text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform mt-4"
               onClick={handleSave}
               disabled={addExpense.isPending || amount <= 0 || !title}
            >
              {addExpense.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              Save Expense <Check className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

      </main>
    </div>
  );
}

function ModeButton({ active, onClick, title, desc, icon }: any) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${active ? 'bg-background shadow-sm border border-border' : 'hover:bg-secondary/50 border border-transparent'}`}
    >
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${active ? 'bg-secondary' : 'bg-transparent'}`}>
        {icon}
      </div>
      <div>
        <p className={`font-medium ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}
