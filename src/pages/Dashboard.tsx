import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus, ArrowUpRight, ArrowDownRight, Wallet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useProfile, useGroups, useCreateGroup } from "@/services/api";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export function Dashboard() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: groups, isLoading: groupsLoading } = useGroups();
  const createGroup = useCreateGroup();
  const navigate = useNavigate();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [guests, setGuests] = useState<string[]>([]);
  const [guestName, setGuestName] = useState("");

  const handleAddGuest = () => {
    if (guestName.trim()) {
      setGuests([...guests, guestName.trim()]);
      setGuestName("");
    }
  };

  const handleRemoveGuest = (index: number) => {
    setGuests(guests.filter((_, i) => i !== index));
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName) return;
    
    // Include the currently typed guest name if they forgot to click add
    const finalGuests = [...guests];
    if (guestName.trim()) {
      finalGuests.push(guestName.trim());
    }

    createGroup.mutate({ name: newGroupName, description: newGroupDesc, guests: finalGuests }, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setNewGroupName("");
        setNewGroupDesc("");
        setGuests([]);
        setGuestName("");
        toast.success("Group created successfully!");
      },
      onError: (error: any) => {
        toast.error(`Error creating group: ${error.message}`);
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">
            {profileLoading ? "Loading..." : `Welcome back, ${profile?.first_name || 'User'}. Here's your financial summary.`}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-full shadow-sm" onClick={() => navigate("/expenses")}>Settle Up</Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full shadow-lg shadow-primary/25">
                <Plus className="mr-2 h-4 w-4" /> New Group
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl">
              <form onSubmit={handleCreateGroup}>
                <DialogHeader>
                  <DialogTitle>Create a new group</DialogTitle>
                  <DialogDescription>
                    Create a group to easily split expenses with friends, family, or roommates.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Group Name</label>
                    <Input 
                      placeholder="e.g. Goa Trip 2026" 
                      className="rounded-xl"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      disabled={createGroup.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description (Optional)</label>
                    <Input 
                      placeholder="e.g. Expenses for our weekend getaway" 
                      className="rounded-xl"
                      value={newGroupDesc}
                      onChange={(e) => setNewGroupDesc(e.target.value)}
                      disabled={createGroup.isPending}
                    />
                  </div>
                  <div className="space-y-2 pt-2 border-t border-border">
                    <label className="text-sm font-medium flex justify-between">
                      <span>Add Members</span>
                      <span className="text-muted-foreground font-normal text-xs">{guests.length} added</span>
                    </label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="e.g. Rohit" 
                        className="rounded-xl flex-1"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddGuest();
                          }
                        }}
                        disabled={createGroup.isPending}
                      />
                      <Button 
                        type="button" 
                        variant="secondary" 
                        className="rounded-xl"
                        onClick={handleAddGuest}
                        disabled={!guestName.trim() || createGroup.isPending}
                      >
                        Add
                      </Button>
                    </div>
                    {guests.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {guests.map((g, i) => (
                          <div key={i} className="bg-secondary/50 px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                            {g}
                            <button 
                              type="button" 
                              onClick={() => handleRemoveGuest(i)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      You can add members by name now, and share an invite link later so they can claim their profile.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="rounded-full w-full" disabled={createGroup.isPending || !newGroupName}>
                    {createGroup.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Group
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BalanceCard 
          title="Total Balance" 
          amount="₹0.00" 
          trend="Live" 
          icon={<Wallet className="text-primary h-6 w-6" />}
          bg="bg-primary/10 text-primary"
          delay={0.1}
        />
        <BalanceCard 
          title="You are owed" 
          amount="₹0.00" 
          trend="Live" 
          icon={<ArrowDownRight className="text-success h-6 w-6" />}
          bg="bg-success/10 text-success"
          delay={0.2}
        />
        <BalanceCard 
          title="You owe" 
          amount="₹0.00" 
          trend="Live" 
          icon={<ArrowUpRight className="text-destructive h-6 w-6" />}
          bg="bg-destructive/10 text-destructive"
          delay={0.3}
        />
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Your Groups */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2 bg-card border border-border rounded-[2rem] p-6 shadow-sm min-h-[300px]"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-lg">Your Groups</h3>
          </div>
          
          {groupsLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
            </div>
          ) : groups?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center px-4">
              <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">You aren't in any groups yet.</p>
              <Button variant="outline" className="rounded-full" onClick={() => setIsCreateOpen(true)}>
                Create your first group
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {groups?.map((group: any) => (
                <div 
                  key={group.id} 
                  onClick={() => navigate(`/groups/${group.id}`)}
                  className="group relative flex flex-col p-5 bg-secondary/30 rounded-2xl border border-border/50 hover:bg-secondary/70 hover:border-border cursor-pointer transition-all"
                >
                  <h4 className="font-semibold text-lg mb-1">{group.name}</h4>
                  {group.description && <p className="text-sm text-muted-foreground line-clamp-1 mb-3">{group.description}</p>}
                  
                  <div className="mt-auto flex justify-between items-center">
                    <span className="text-xs font-medium px-2 py-1 bg-background rounded-md">Live</span>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Activity Placeholder */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-card border border-border rounded-[2rem] p-6 shadow-sm flex flex-col cursor-pointer hover:shadow-md transition-all"
          onClick={() => navigate('/activity')}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-lg">Recent Activity</h3>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 flex items-center justify-center text-center">
            <p className="text-muted-foreground text-sm">Add expenses to see your activity feed.</p>
          </div>
        </motion.div>

      </div>

    </div>
  );
}

function BalanceCard({ title, amount, trend, icon, bg, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      className="bg-card border border-border rounded-[2rem] p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all"
    >
      <div className={`absolute -right-6 -top-6 h-32 w-32 rounded-full ${bg} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity`}></div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`h-12 w-12 rounded-2xl ${bg} flex items-center justify-center`}>
          {icon}
        </div>
        <span className={`text-sm font-medium ${trend === 'Live' ? 'text-primary' : trend.startsWith('+') ? 'text-success' : 'text-destructive'} bg-background px-2 py-1 rounded-md border border-border shadow-sm`}>
          {trend}
        </span>
      </div>
      <div className="relative z-10">
        <p className="text-muted-foreground font-medium mb-1">{title}</p>
        <h2 className="text-3xl font-semibold tracking-tight">{amount}</h2>
      </div>
    </motion.div>
  );
}
