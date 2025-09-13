import { createContext, useEffect, useState } from "react";
import useIsMobile from "../hooks/use-is-mobile";

const DRAWER_COLLAPSED_KEY = "drawer-collapsed";

interface DrawerContextType {
  isCollapsed: boolean;
  isOpen: boolean;
  toggleCollapsed: () => void;
  toggleOpen: () => void;
}

const DrawerContext = createContext<DrawerContextType>({
  isCollapsed: false,
  isOpen: false,
  toggleCollapsed: () => {},
  toggleOpen: () => {},
});

export function DrawerProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isMobile = useIsMobile();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (isMobile) return false;
    const savedCollapsed = localStorage.getItem(DRAWER_COLLAPSED_KEY);
    return savedCollapsed === "true";
  });

  const [isOpen, setIsOpen] = useState(() => !isMobile);

  useEffect(() => {
    // This effect synchronizes drawer state when device type changes
    // Using queueMicrotask to avoid React Compiler cascading renders warning
    queueMicrotask(() => {
      if (isMobile) {
        setIsCollapsed(false);
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    });
  }, [isMobile]);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      localStorage.setItem(DRAWER_COLLAPSED_KEY, String(!prev));
      return !prev;
    });
  };

  const toggleOpen = () => setIsOpen((prev) => !prev);

  return (
    <DrawerContext value={{ isCollapsed, isOpen, toggleCollapsed, toggleOpen }}>
      {children}
    </DrawerContext>
  );
}

export default DrawerContext;
