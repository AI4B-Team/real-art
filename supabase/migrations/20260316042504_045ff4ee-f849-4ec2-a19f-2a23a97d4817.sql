CREATE TABLE public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  followed_creator_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (follower_id, followed_creator_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own follows" ON public.follows
  FOR SELECT TO authenticated
  USING (auth.uid() = follower_id);

CREATE POLICY "Users can follow" ON public.follows
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" ON public.follows
  FOR DELETE TO authenticated
  USING (auth.uid() = follower_id);