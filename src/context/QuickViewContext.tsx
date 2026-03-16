import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

export interface QuickViewImage {
  id: string;
  photo: string;
  title?: string;
  creatorIndex?: number;
}

interface QuickViewContextType {
  image: QuickViewImage | null;
  open: (img: QuickViewImage) => void;
  close: () => void;
  isOpen: boolean;
}

const QuickViewContext = createContext<QuickViewContextType>({
  image: null, open: () => {}, close: () => {}, isOpen: false,
});

export const useQuickView = () => useContext(QuickViewContext);

export function QuickViewProvider({ children }: { children: ReactNode }) {
  const [image, setImage] = useState<QuickViewImage | null>(null);
  const [prevPath, setPrevPath] = useState("/");

  const open = useCallback((img: QuickViewImage) => {
    setPrevPath(window.location.pathname + window.location.search);
    setImage(img);
    window.history.pushState({ quickView: true, id: img.id }, "", `/image/${img.id}`);
  }, []);

  const close = useCallback(() => {
    setImage(null);
    window.history.pushState({}, "", prevPath);
  }, [prevPath]);

  useEffect(() => {
    const handler = (e: PopStateEvent) => {
      if (!e.state?.quickView) setImage(null);
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  return (
    <QuickViewContext.Provider value={{ image, open, close, isOpen: !!image }}>
      {children}
    </QuickViewContext.Provider>
  );
}
