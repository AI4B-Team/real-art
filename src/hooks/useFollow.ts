import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useFollow(creatorId: string) {
  const [followed, setFollowed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const { data } = await supabase
        .from("follows" as any)
        .select("id")
        .eq("follower_id", user.id)
        .eq("followed_creator_id", creatorId)
        .maybeSingle();
      if (!cancelled) setFollowed(!!data);
    })();
    return () => { cancelled = true; };
  }, [creatorId]);

  const toggle = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setLoading(true);
    if (followed) {
      await (supabase.from("follows" as any) as any).delete()
        .eq("follower_id", user.id)
        .eq("followed_creator_id", creatorId);
      setFollowed(false);
    } else {
      await (supabase.from("follows" as any) as any).insert({
        follower_id: user.id,
        followed_creator_id: creatorId,
      });
      setFollowed(true);
    }
    setLoading(false);
  }, [followed, creatorId]);

  return { followed, toggle, loading };
}
