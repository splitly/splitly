-- 1. Drop the foreign key constraint on auth.users so we can insert guest profiles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Make email optional since guests won't have an email initially
ALTER TABLE profiles ALTER COLUMN email DROP NOT NULL;

-- 3. Add an is_guest boolean flag to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT false;

-- 4. Create an RPC function to claim a guest profile
-- This function takes a guest_profile_id and transfers all data to the logged-in user's profile
CREATE OR REPLACE FUNCTION claim_guest_profile(guest_profile_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Ensure the guest profile exists and is actually a guest
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = guest_profile_id AND is_guest = true) THEN
    RAISE EXCEPTION 'Invalid guest profile';
  END IF;

  -- 1. Update expenses where the guest paid
  UPDATE expenses SET paid_by = current_user_id WHERE paid_by = guest_profile_id;
  
  -- 2. Update expense splits where the guest is involved
  UPDATE expense_splits SET user_id = current_user_id WHERE user_id = guest_profile_id;
  
  -- 3. Update group members
  -- If the real user is already in the group, we might have a unique constraint violation on (group_id, user_id).
  -- We handle this by updating where possible, and deleting duplicates.
  -- First, delete the guest membership if the real user is already in that specific group:
  DELETE FROM group_members 
  WHERE user_id = guest_profile_id 
  AND group_id IN (SELECT group_id FROM group_members WHERE user_id = current_user_id);
  
  -- Then update the remaining guest memberships to point to the real user
  UPDATE group_members SET user_id = current_user_id WHERE user_id = guest_profile_id;

  -- 4. Update settlements
  UPDATE settlements SET paid_by = current_user_id WHERE paid_by = guest_profile_id;
  UPDATE settlements SET paid_to = current_user_id WHERE paid_to = guest_profile_id;
  
  -- 5. Delete the old guest profile
  DELETE FROM profiles WHERE id = guest_profile_id;
END;
$$;
