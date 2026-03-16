import { createContext, useContext } from "react";

export const LayoutContext = createContext({
  hasGlobalNavbar: false,
  sidebarCollapsed: false,
  setSidebarCollapsed: (_v: boolean) => {},
});

export const useLayoutContext = () => useContext(LayoutContext);
