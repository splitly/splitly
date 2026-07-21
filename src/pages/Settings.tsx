import { useState, useEffect } from "react";
import { useProfile, useUpdateProfile } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, User, Save, LogOut } from "lucide-react";
import { useSignOut } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function Settings() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const signOut = useSignOut();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
    }
  }, [profile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({ first_name: firstName, last_name: lastName }, {
      onSuccess: () => toast.success("Profile updated successfully!"),
      onError: (err: any) => toast.error(`Error updating profile: ${err.message}`)
    });
  };

  const handleLogout = () => {
    signOut.mutate(undefined, {
      onSuccess: () => navigate("/login")
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm">
        <h3 className="text-lg font-semibold mb-6 flex items-center">
          <User className="mr-2 h-5 w-5 text-primary" /> Profile Information
        </h3>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First name</label>
              <Input 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                className="rounded-xl bg-secondary/30" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last name</label>
              <Input 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
                className="rounded-xl bg-secondary/30" 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Email address</label>
            <Input 
              value={profile?.email || ""} 
              disabled 
              className="rounded-xl bg-secondary/30 opacity-70 cursor-not-allowed" 
            />
            <p className="text-xs text-muted-foreground">Your email cannot be changed.</p>
          </div>

          <div className="pt-4 flex justify-between items-center border-t border-border">
            <Button type="button" variant="destructive" onClick={handleLogout} className="rounded-full">
              <LogOut className="mr-2 h-4 w-4" /> Log out
            </Button>
            
            <Button type="submit" disabled={updateProfile.isPending} className="rounded-full">
              {updateProfile.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
