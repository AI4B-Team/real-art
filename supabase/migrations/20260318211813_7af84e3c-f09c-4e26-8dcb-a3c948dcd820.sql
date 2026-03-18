
CREATE TABLE public.characters (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  avatar_url text,
  training_images text[] DEFAULT '{}'::text[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own characters"
  ON public.characters FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create characters"
  ON public.characters FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own characters"
  ON public.characters FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own characters"
  ON public.characters FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_characters_updated_at
  BEFORE UPDATE ON public.characters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO storage.buckets (id, name, public)
VALUES ('character-images', 'character-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload character images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'character-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Character images are publicly viewable"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'character-images');

CREATE POLICY "Users can delete own character images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'character-images' AND (storage.foldername(name))[1] = auth.uid()::text);
