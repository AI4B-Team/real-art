import { createContext, useContext } from "react";

/**
 * Context to signal that the global layout (AuthLayout) is already
 * rendering Navbar, so individual pages should skip their own <Navbar />.
 */
export const LayoutContext = createContext({ hasGlobalNavbar: false });

export const useLayoutContext = () => useContext(LayoutContext);
