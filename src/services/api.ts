import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// ==== PROFILES ====
export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });
}

// ==== GROUPS ====
export function useGroups() {
  return useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      // Fetch groups where the user is a member
      const { data, error } = await supabase
        .from("group_members")
        .select(`
          group_id,
          groups (*)
        `)
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data.map((item: any) => item.groups);
    },
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newGroup: { name: string, description?: string, guests?: string[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      // 1. Create the group
      const { data: group, error: groupError } = await supabase
        .from("groups")
        .insert([{ name: newGroup.name, description: newGroup.description, created_by: user.id }])
        .select()
        .single();
        
      if (groupError) throw groupError;

      // 2. Add creator as a member
      const { error: memberError } = await supabase
        .from("group_members")
        .insert([{ group_id: group.id, user_id: user.id, role: 'admin' }]);
        
      if (memberError) throw memberError;

      // 3. Add guest members if any
      if (newGroup.guests && newGroup.guests.length > 0) {
        // Create guest profiles with generated IDs since profiles.id doesn't have a default value
        const guestProfiles = newGroup.guests.map(guestName => ({
          id: crypto.randomUUID(),
          first_name: guestName,
          is_guest: true
        }));

        const { data: createdGuests, error: guestError } = await supabase
          .from("profiles")
          .insert(guestProfiles)
          .select('id');

        if (guestError) throw guestError;

        // Link guests to the group
        if (createdGuests) {
          const guestMembers = createdGuests.map(g => ({
            group_id: group.id,
            user_id: g.id,
            role: 'member'
          }));
          
          const { error: linkError } = await supabase
            .from("group_members")
            .insert(guestMembers);
            
          if (linkError) throw linkError;
        }
      }

      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useGroupDetails(groupId: string) {
  return useQuery({
    queryKey: ["group", groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select(`
          *,
          group_members (
            user_id,
            role,
            profiles (id, first_name, last_name, email, avatar_url)
          ),
          expenses (
            id, title, amount, expense_date, paid_by,
            profiles (id, first_name, last_name, avatar_url),
            expense_splits (user_id, amount)
          )
        `)
        .eq("id", groupId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!groupId
  });
}

export function useAddMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, email }: { groupId: string, email: string }) => {
      // 1. Find user by email in profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();
      
      if (profileError || !profile) {
        throw new Error("User not found. They must sign up first!");
      }

      // 2. Add to group_members
      const { data, error } = await supabase
        .from("group_members")
        .insert([{ group_id: groupId, user_id: profile.id, role: "member" }])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["group", variables.groupId] });
    },
  });
}

// ==== EXPENSES ====
export function useAddExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      groupId, title, amount, paidBy, splits 
    }: { 
      groupId: string, title: string, amount: number, paidBy: string, 
      splits: { userId: string, amount: number }[] 
    }) => {
      // 1. Create expense
      const { data: expense, error: expenseError } = await supabase
        .from("expenses")
        .insert([{ group_id: groupId, title, amount, paid_by: paidBy }])
        .select()
        .single();
      
      if (expenseError) throw expenseError;

      // 2. Create splits
      const splitInserts = splits.map(s => ({
        expense_id: expense.id,
        user_id: s.userId,
        amount: s.amount
      }));

      const { error: splitsError } = await supabase
        .from("expense_splits")
        .insert(splitInserts);

      if (splitsError) throw splitsError;

      return expense;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["group", variables.groupId] });
    },
  });
}

// ==== EXTENDED DATA HOOKS ====
export function useAllExpenses() {
  return useQuery({
    queryKey: ["all_expenses"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      // First get all group IDs the user belongs to
      const { data: members, error: memberError } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);
      
      if (memberError) throw memberError;
      
      if (!members || members.length === 0) return [];
      
      const groupIds = members.map((m: any) => m.group_id);

      // Now fetch expenses for these groups
      const { data, error } = await supabase
        .from("expenses")
        .select(`
          *,
          groups (name),
          profiles (first_name, last_name, avatar_url)
        `)
        .in("group_id", groupIds)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: { first_name?: string, last_name?: string, default_currency?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  });
}

export function useJoinGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (groupId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      // Check if already a member
      const { data: existing } = await supabase
        .from("group_members")
        .select("id")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .single();
        
      if (existing) return existing;

      const { data, error } = await supabase
        .from("group_members")
        .insert([{ group_id: groupId, user_id: user.id, role: 'member' }])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
    }
  });
}

export function useClaimProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (guestProfileId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      // Call the RPC function to transfer all data from the guest profile to the real profile
      const { error } = await supabase.rpc('claim_guest_profile', { 
        guest_profile_id: guestProfileId 
      });
        
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["group"] });
      queryClient.invalidateQueries({ queryKey: ["all_expenses"] });
    }
  });
}
