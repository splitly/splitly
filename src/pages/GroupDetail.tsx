import { useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Settings, Users, ArrowUpRight, ArrowDownRight, MoreVertical, Search, Filter, Plus, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useGroupDetails, useAddMember, useProfile, useDeleteGroup, useRemoveMember, useAddGuestMember, useRecordSettlement } from "@/services/api";
import { calculateOptimalSettlements } from "@/lib/balanceEngine";
import { toast } from "sonner";

export function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("expenses");
  
  const { data: profile } = useProfile();
  const { data: group, isLoading, error } = useGroupDetails(id || "");
  const addMember = useAddMember();
  const removeMember = useRemoveMember();
  const addGuestMember = useAddGuestMember();
  const deleteGroup = useDeleteGroup();
  const recordSettlement = useRecordSettlement();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [settleAmount, setSettleAmount] = useState("");
  const [settlePaidBy, setSettlePaidBy] = useState("");
  const [settlePaidTo, setSettlePaidTo] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [newGuestName, setNewGuestName] = useState("");

  const handleSettleUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !settleAmount || !settlePaidBy || !settlePaidTo) return;
    
    recordSettlement.mutate({
      groupId: id,
      paidBy: settlePaidBy,
      paidTo: settlePaidTo,
      amount: parseFloat(settleAmount)
    }, {
      onSuccess: () => {
        setIsSettleOpen(false);
        setSettleAmount("");
        setSettlePaidBy("");
        setSettlePaidTo("");
        toast.success("Payment recorded successfully");
      },
      onError: (err: any) => toast.error(err.message)
    });
  };

  const handleAddGuest = () => {
    if (!id || !newGuestName.trim()) return;
    addGuestMember.mutate({ groupId: id, guestName: newGuestName.trim() }, {
      onSuccess: () => {
        setNewGuestName("");
        toast.success("Member added successfully");
      },
      onError: (err: any) => {
        toast.error(err.message);
      }
    });
  };

  const handleRemoveMember = (memberId: string) => {
    if (!id) return;
    if (confirm("Are you sure you want to remove this member?")) {
      removeMember.mutate({ groupId: id, memberId }, {
        onSuccess: () => toast.success("Member removed"),
        onError: (err: any) => toast.error(err.message)
      });
    }
  };

  const handleDeleteGroup = () => {
    if (!id) return;
    if (confirm("Are you sure you want to delete this group? All expenses and settlements will be permanently deleted.")) {
      deleteGroup.mutate(id, {
        onSuccess: () => {
          toast.success("Group deleted successfully");
          navigate("/dashboard");
        },
        onError: (err: any) => {
          toast.error(`Error deleting group: ${err.message}`);
        }
      });
    }
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError("");
    if (!inviteEmail || !id) return;
    
    addMember.mutate({ groupId: id, email: inviteEmail }, {
      onSuccess: () => {
        setIsInviteOpen(false);
        setInviteEmail("");
      },
      onError: (err) => {
        setInviteError(err.message);
      }
    });
  };

  // Compute Balances
  const settlements = useMemo(() => {
    if (!group?.expenses) return [];
    
    const userBalances: Record<string, number> = {};
    
    group.expenses.forEach((ex: any) => {
      userBalances[ex.paid_by] = (userBalances[ex.paid_by] || 0) + ex.amount;
      ex.expense_splits.forEach((split: any) => {
        userBalances[split.user_id] = (userBalances[split.user_id] || 0) - split.amount;
      });
    });

    const balances = Object.keys(userBalances).map(userId => ({
      userId,
      amount: userBalances[userId]
    }));

    return calculateOptimalSettlements(balances);
  }, [group?.expenses]);

  const { totalOwedToMe, totalIOwe } = useMemo(() => {
    if (!profile?.id) return { totalOwedToMe: 0, totalIOwe: 0 };
    
    let owedToMe = 0;
    let iOwe = 0;
    
    settlements.forEach(s => {
      if (s.toUserId === profile.id) owedToMe += s.amount;
      if (s.fromUserId === profile.id) iOwe += s.amount;
    });

    return { totalOwedToMe: owedToMe, totalIOwe: iOwe };
  }, [settlements, profile?.id]);

  // Helper to find a user's name
  const getUserName = (userId: string) => {
    if (userId === profile?.id) return "You";
    const member = group?.group_members?.find((m: any) => m.profiles?.id === userId);
    return member?.profiles?.first_name || "Unknown";
  };

  const getUserAvatar = (userId: string) => {
    const member = group?.group_members?.find((m: any) => m.profiles?.id === userId);
    return member?.profiles?.avatar_url || "";
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-secondary/20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="flex h-screen items-center justify-center bg-secondary/20">
        <p className="text-destructive">Error loading group details.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-secondary/20 overflow-hidden">
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="flex-1 overflow-auto no-scrollbar relative">
          
          {/* Header Cover */}
          <div className="h-64 md:h-80 w-full relative bg-primary/10">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10"></div>
            {/* We can use a random unsplash image or placeholder for the group */}
            <img 
              src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
              alt={group.name} 
              className="w-full h-full object-cover mix-blend-overlay"
            />
            
            <div className="absolute top-0 inset-x-0 p-6 z-20 flex justify-between items-center text-white">
              <Button variant="ghost" size="icon" className="rounded-full bg-black/20 backdrop-blur-md hover:bg-black/40 text-white">
                <Link to="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="rounded-full bg-black/20 backdrop-blur-md hover:bg-black/40 text-white" onClick={() => toast("Search coming soon")}>
                  <Search className="h-5 w-5" />
                </Button>
                <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full bg-black/20 backdrop-blur-md hover:bg-black/40 text-white">
                      <Settings className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] rounded-3xl">
                    <DialogHeader>
                      <DialogTitle>Group Settings</DialogTitle>
                      <DialogDescription>
                        Manage your group preferences.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 flex flex-col gap-6">
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold">Members</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 no-scrollbar">
                          {group.group_members?.map((member: any) => (
                            <div key={member.user_id} className="flex items-center justify-between p-2 rounded-xl bg-secondary/50">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>{member.profiles?.first_name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{member.profiles?.first_name} {member.profiles?.id === profile?.id ? "(You)" : ""}</span>
                              </div>
                              {member.profiles?.id !== profile?.id && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-destructive h-8 text-xs hover:bg-destructive/10"
                                  onClick={() => handleRemoveMember(member.user_id)}
                                  disabled={removeMember.isPending}
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex gap-2 pt-2 border-t border-border">
                          <Input 
                            placeholder="Add member by name" 
                            className="rounded-xl flex-1 text-sm h-9"
                            value={newGuestName}
                            onChange={(e) => setNewGuestName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddGuest()}
                            disabled={addGuestMember.isPending}
                          />
                          <Button 
                            variant="secondary" 
                            size="sm"
                            className="rounded-xl h-9 px-4"
                            onClick={handleAddGuest}
                            disabled={!newGuestName.trim() || addGuestMember.isPending}
                          >
                            {addGuestMember.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Add"}
                          </Button>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border">
                        <Button 
                          variant="destructive" 
                          className="w-full rounded-xl flex items-center justify-center gap-2"
                          onClick={handleDeleteGroup}
                          disabled={deleteGroup.isPending}
                        >
                          {deleteGroup.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                          Delete Group
                        </Button>
                        <p className="text-[10px] text-muted-foreground text-center mt-2">
                          Only group admins can delete the group.
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          <div className="px-6 md:px-12 -mt-20 relative z-20 max-w-6xl mx-auto mb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <Badge variant="outline" className="mb-4 bg-background/50 backdrop-blur-md border-border/50 text-foreground">
                  Group
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">{group.name}</h1>
                {group.description && <p className="text-muted-foreground mb-1">{group.description}</p>}
                <p className="text-sm text-muted-foreground">{group.group_members?.length || 0} Members</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {group.group_members?.slice(0, 4).map((member: any) => (
                    <Avatar key={member.user_id} className="h-10 w-10 border-2 border-background shadow-sm">
                      {member.profiles?.avatar_url ? (
                        <AvatarImage src={member.profiles.avatar_url} />
                      ) : (
                        <AvatarFallback>{member.profiles?.first_name?.charAt(0) || 'U'}</AvatarFallback>
                      )}
                    </Avatar>
                  ))}
                  {group.group_members?.length > 4 && (
                    <div className="h-10 w-10 border-2 border-background rounded-full bg-secondary flex items-center justify-center text-xs font-medium z-10">
                      +{group.group_members.length - 4}
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="secondary" 
                  className="rounded-full shadow-sm"
                  onClick={() => {
                    const joinLink = `${window.location.origin}/join/${id}`;
                    navigator.clipboard.writeText(joinLink);
                    toast.success("Invite link copied to clipboard!");
                  }}
                >
                  <Users className="mr-2 h-4 w-4" /> Share Link
                </Button>
                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="rounded-full shadow-sm">
                      <Plus className="mr-2 h-4 w-4" /> Invite by Email
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] rounded-3xl">
                    <form onSubmit={handleInvite}>
                      <DialogHeader>
                        <DialogTitle>Invite a member</DialogTitle>
                        <DialogDescription>
                          Enter your friend's email address. They must have already signed up to SplitX.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Email address</label>
                          <Input 
                            type="email"
                            placeholder="friend@example.com" 
                            className="rounded-xl"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            disabled={addMember.isPending}
                          />
                          {inviteError && <p className="text-xs text-destructive">{inviteError}</p>}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" className="rounded-full w-full" disabled={addMember.isPending || !inviteEmail}>
                          {addMember.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Add Member
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Quick Balances */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              <div className="p-6 rounded-[2rem] bg-card border border-border shadow-sm flex items-center gap-4 group hover:border-success/50 transition-colors">
                <div className="h-12 w-12 rounded-2xl bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
                  <ArrowDownRight className="text-success h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Total you are owed</p>
                  <p className="text-2xl font-semibold text-success">₹{totalOwedToMe.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="p-6 rounded-[2rem] bg-card border border-border shadow-sm flex items-center gap-4 group hover:border-destructive/50 transition-colors">
                <div className="h-12 w-12 rounded-2xl bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                  <ArrowUpRight className="text-destructive h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Total you owe</p>
                  <p className="text-2xl font-semibold text-destructive">₹{totalIOwe.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-border mb-8 overflow-x-auto no-scrollbar">
              {['expenses', 'balances'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-medium capitalize whitespace-nowrap relative transition-colors ${activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'expenses' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">All Expenses</h3>
                  <Button variant="outline" size="sm" className="rounded-full h-8" onClick={() => toast("Filters coming soon")}><Filter className="h-3.5 w-3.5 mr-2" /> Filter</Button>
                </div>

                <div className="space-y-4">
                  {group.expenses?.length === 0 ? (
                    <div className="text-center py-10 bg-card rounded-3xl border border-border border-dashed">
                      <p className="text-muted-foreground mb-4">No expenses added yet.</p>
                      <Button onClick={() => navigate(`/expense/new?group_id=${id}`)} className="rounded-full">Add first expense</Button>
                    </div>
                  ) : (
                    group.expenses?.map((ex: any) => {
                      const isPaidByMe = ex.paid_by === profile?.id;
                      const mySplit = ex.expense_splits.find((s: any) => s.user_id === profile?.id);
                      let actionText = "";
                      let actionColor = "text-muted-foreground";

                      if (isPaidByMe) {
                        const amountLent = ex.amount - (mySplit?.amount || 0);
                        if (amountLent > 0) {
                          actionText = `You lent ₹${amountLent.toFixed(2)}`;
                          actionColor = "text-success";
                        } else {
                          actionText = "You paid for yourself";
                        }
                      } else if (mySplit) {
                        actionText = `You owe ₹${mySplit.amount.toFixed(2)}`;
                        actionColor = "text-destructive";
                      } else {
                        actionText = "Not involved";
                      }

                      return (
                        <div 
                          key={ex.id} 
                          className="group flex items-center justify-between p-4 rounded-3xl bg-card border border-border/50 hover:border-border hover:shadow-md transition-all cursor-pointer"
                          onClick={() => navigate(`/expense/edit/${ex.id}`)}
                        >
                          <div className="flex items-center gap-5">
                            <div className="h-14 w-14 rounded-[1.25rem] flex items-center justify-center text-2xl bg-secondary">
                              🧾
                            </div>
                            <div>
                              <p className="font-semibold text-lg">{ex.title}</p>
                              <p className="text-sm text-muted-foreground">{new Date(ex.expense_date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right hidden sm:block">
                              <p className="font-semibold">₹{ex.amount.toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">Paid by {getUserName(ex.paid_by)}</p>
                            </div>
                            <div className="text-right hidden md:block w-32">
                               <p className={`text-sm font-medium ${actionColor}`}>
                                 {actionText}
                               </p>
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); navigate(`/expense/edit/${ex.id}`); }}>
                              <MoreVertical className="h-5 w-5 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'balances' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                 <div className="p-8 rounded-[2.5rem] bg-card border border-border shadow-sm text-center max-w-md mx-auto mt-10">
                    <p className="text-xl font-semibold mb-2">Optimal Settlements</p>
                    <p className="text-muted-foreground mb-6 text-sm">SplitX calculates the minimum transactions needed to settle debts.</p>
                    
                    <div className="space-y-4 mb-8 text-left">
                      {settlements.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">All settled up!</div>
                      ) : (
                        settlements.map((s, i) => (
                          <div 
                            key={i} 
                            className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl cursor-pointer hover:bg-secondary/50 transition-colors"
                            onClick={() => {
                              setSettlePaidBy(s.fromUserId);
                              setSettlePaidTo(s.toUserId);
                              setSettleAmount(s.amount.toString());
                              setIsSettleOpen(true);
                            }}
                          >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={getUserAvatar(s.fromUserId)} />
                                  <AvatarFallback>{getUserName(s.fromUserId).charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-sm">{getUserName(s.fromUserId)}</span>
                                
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={getUserAvatar(s.toUserId)} />
                                  <AvatarFallback>{getUserName(s.toUserId).charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-sm">{getUserName(s.toUserId)}</span>
                              </div>
                              <span className="font-semibold">₹{s.amount.toFixed(2)}</span>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <Dialog open={isSettleOpen} onOpenChange={setIsSettleOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full rounded-full h-12 shadow-md shadow-primary/20">Record a payment</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] rounded-3xl">
                        <form onSubmit={handleSettleUp}>
                          <DialogHeader>
                            <DialogTitle>Record Payment</DialogTitle>
                            <DialogDescription>
                              Record a settlement or initial funding.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-6 py-6">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Who paid?</label>
                              <select 
                                className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                value={settlePaidBy}
                                onChange={(e) => setSettlePaidBy(e.target.value)}
                                required
                              >
                                <option value="" disabled>Select member</option>
                                {group.group_members?.map((m: any) => (
                                  <option key={m.user_id} value={m.user_id}>{m.profiles?.first_name}</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">Who received?</label>
                              <select 
                                className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                value={settlePaidTo}
                                onChange={(e) => setSettlePaidTo(e.target.value)}
                                required
                              >
                                <option value="" disabled>Select member</option>
                                {group.group_members?.map((m: any) => (
                                  <option key={m.user_id} value={m.user_id}>{m.profiles?.first_name}</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">Amount</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">₹</span>
                                <Input 
                                  type="number"
                                  placeholder="0.00" 
                                  className="rounded-xl pl-7"
                                  value={settleAmount}
                                  onChange={(e) => setSettleAmount(e.target.value)}
                                  disabled={recordSettlement.isPending}
                                  required
                                />
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit" className="rounded-full w-full" disabled={recordSettlement.isPending || !settleAmount || !settlePaidBy || !settlePaidTo || settlePaidBy === settlePaidTo}>
                              {recordSettlement.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                              Record Payment
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>

                 </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="absolute bottom-8 right-8 z-50">
          <Button 
            onClick={() => navigate(`/expense/new?group_id=${id}`)}
            size="icon" 
            className="h-16 w-16 rounded-full shadow-2xl shadow-primary/40 hover:scale-105 transition-transform"
          >
            <Plus className="h-8 w-8" />
          </Button>
        </div>
      </main>
    </div>
  );
}
