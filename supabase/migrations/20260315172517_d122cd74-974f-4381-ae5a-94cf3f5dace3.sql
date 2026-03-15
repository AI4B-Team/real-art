
-- Ad campaign status enum
CREATE TYPE public.ad_status AS ENUM ('draft', 'pending', 'active', 'paused', 'completed', 'rejected');

-- Ad placement type enum
CREATE TYPE public.ad_placement AS ENUM ('explore_feed', 'search_results', 'image_sidebar');

-- Ad campaigns table
CREATE TABLE public.ad_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  status ad_status NOT NULL DEFAULT 'draft',
  placements ad_placement[] NOT NULL DEFAULT '{}',
  targeting_tags TEXT[] DEFAULT '{}',
  daily_budget_cents INTEGER NOT NULL DEFAULT 500,
  total_budget_cents INTEGER NOT NULL DEFAULT 5000,
  spent_cents INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  stripe_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;

-- Users can view their own campaigns
CREATE POLICY "Users can view own campaigns"
  ON public.ad_campaigns FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create campaigns
CREATE POLICY "Users can create campaigns"
  ON public.ad_campaigns FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update own campaigns
CREATE POLICY "Users can update own campaigns"
  ON public.ad_campaigns FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete own draft campaigns
CREATE POLICY "Users can delete own campaigns"
  ON public.ad_campaigns FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'draft');

-- Public can view active campaigns (for displaying ads)
CREATE POLICY "Active campaigns viewable by all"
  ON public.ad_campaigns FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

-- Updated_at trigger
CREATE TRIGGER update_ad_campaigns_updated_at
  BEFORE UPDATE ON public.ad_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
