import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

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
  const location = useLocation();
  const openedFromPath = useRef<string | null>(null);

  const open = useCallback((img: QuickViewImage) => {
    const currentPath = window.location.pathname + window.location.search;
    setPrevPath(currentPath);
    openedFromPath.current = currentPath;
    setImage(img);
    window.history.pushState({ quickView: true, id: img.id }, "", `/image/${img.id}`);
  }, []);

  const close = useCallback(() => {
    setImage(null);
    openedFromPath.current = null;
    window.history.pushState({}, "", prevPath);
  }, [prevPath]);

  // Auto-close when React Router navigates to a different page
  useEffect(() => {
    if (image && openedFromPath.current !== null) {
      // If the route changed to something other than the quickview image URL, close it
      const quickViewPath = `/image/${image.id}`;
      if (location.pathname !== quickViewPath && location.pathname !== openedFromPath.current) {
        setImage(null);
        openedFromPath.current = null;
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: PopStateEvent) => {
      if (!e.state?.quickView) {
        setImage(null);
        openedFromPath.current = null;
      }
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
