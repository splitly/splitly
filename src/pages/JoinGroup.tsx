import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGroupDetails, useClaimProfile, useJoinGroup } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Loader2, Users, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

export function JoinGroup() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: group, isLoading, error } = useGroupDetails(id || "");
  const claimProfile = useClaimProfile();
  const joinGroup = useJoinGroup();
  
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);

  const handleJoinAsNew = () => {
    if (!id) return;
    joinGroup.mutate(id, {
      onSuccess: () => {
        toast.success("Joined group successfully!");
        navigate(`/groups/${id}`);
      },
      onError: (err: any) => {
        toast.error(`Error joining group: ${err.message}`);
      }
    });
  };

  const handleClaim = () => {
    if (!id || !selectedGuest) return;
    claimProfile.mutate(selectedGuest, {
      onSuccess: () => {
        toast.success("Profile claimed successfully!");
        navigate(`/groups/${id}`);
      },
      onError: (err: any) => {
        toast.error(`Error claiming profile: ${err.message}`);
      }
    });
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
      <div className="flex h-screen flex-col items-center justify-center bg-secondary/20 p-6 text-center">
        <p className="text-xl font-semibold mb-2">Group Not Found</p>
        <p className="text-muted-foreground mb-6">The invite link might be invalid or expired.</p>
        <Button onClick={() => navigate("/")} className="rounded-full">Go to Dashboard</Button>
      </div>
    );
  }

  const guestMembers = group.group_members?.filter((m: any) => m.profiles?.is_guest) || [];

  return (
    <div className="min-h-screen bg-secondary/20 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-card rounded-[2rem] border border-border p-8 shadow-xl">
        <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
          <Users className="h-8 w-8 text-primary" />
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2">Join {group.name}</h1>
        <p className="text-muted-foreground text-center mb-8">
          You've been invited to join this group to split expenses.
        </p>

        {guestMembers.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold mb-4 text-center">Are you one of these people?</h3>
            <div className="space-y-3">
              {guestMembers.map((member: any) => (
                <button
                  key={member.user_id}
                  onClick={() => setSelectedGuest(member.user_id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    selectedGuest === member.user_id 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border/50 hover:bg-secondary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{member.profiles?.first_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-lg">{member.profiles?.first_name}</span>
                  </div>
                  {selectedGuest === member.user_id && (
                    <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                      <div className="h-2 w-2 bg-background rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            {selectedGuest && (
              <Button 
                className="w-full rounded-full mt-4 h-12 shadow-md shadow-primary/25"
                onClick={handleClaim}
                disabled={claimProfile.isPending}
              >
                {claimProfile.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Yes, this is me
              </Button>
            )}
          </div>
        )}

        <div className="relative border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm font-medium mb-4">Or join as a new member</p>
          <Button 
            variant="outline" 
            className="w-full rounded-full h-12"
            onClick={handleJoinAsNew}
            disabled={joinGroup.isPending}
          >
            {joinGroup.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Join as new member <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
