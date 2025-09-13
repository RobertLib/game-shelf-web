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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile) {
      const savedCollapsed = localStorage.getItem(DRAWER_COLLAPSED_KEY);

      if (savedCollapsed !== null) {
        setIsCollapsed(savedCollapsed === "true");
      }
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(false);
    }
    setIsOpen(!isMobile);
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
