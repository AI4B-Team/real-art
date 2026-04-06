
-- Ebooks table
CREATE TABLE public.ebooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled',
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  cover_color TEXT DEFAULT '#6366F1',
  cover_image TEXT,
  tags TEXT[] DEFAULT '{}',
  progress INTEGER DEFAULT 0,
  chapters INTEGER DEFAULT 0,
  words INTEGER DEFAULT 0,
  prompt TEXT DEFAULT '',
  tone TEXT DEFAULT 'professional',
  language TEXT DEFAULT 'en',
  model TEXT DEFAULT 'auto',
  outline JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ebook pages table
CREATE TABLE public.ebook_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ebook_id UUID NOT NULL REFERENCES public.ebooks(id) ON DELETE CASCADE,
  page_index INTEGER NOT NULL DEFAULT 0,
  title TEXT DEFAULT '',
  page_type TEXT NOT NULL DEFAULT 'chapter-page',
  content TEXT DEFAULT '',
  elements JSONB DEFAULT '[]',
  locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ebook_pages ENABLE ROW LEVEL SECURITY;

-- Ebooks policies
CREATE POLICY "Users can view own ebooks" ON public.ebooks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create ebooks" ON public.ebooks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ebooks" ON public.ebooks FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ebooks" ON public.ebooks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Ebook pages policies
CREATE POLICY "Users can view own ebook pages" ON public.ebook_pages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ebooks WHERE ebooks.id = ebook_pages.ebook_id AND ebooks.user_id = auth.uid()));
CREATE POLICY "Users can create ebook pages" ON public.ebook_pages FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.ebooks WHERE ebooks.id = ebook_pages.ebook_id AND ebooks.user_id = auth.uid()));
CREATE POLICY "Users can update own ebook pages" ON public.ebook_pages FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ebooks WHERE ebooks.id = ebook_pages.ebook_id AND ebooks.user_id = auth.uid()));
CREATE POLICY "Users can delete own ebook pages" ON public.ebook_pages FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ebooks WHERE ebooks.id = ebook_pages.ebook_id AND ebooks.user_id = auth.uid()));

-- Updated_at triggers
CREATE TRIGGER update_ebooks_updated_at BEFORE UPDATE ON public.ebooks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ebook_pages_updated_at BEFORE UPDATE ON public.ebook_pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
