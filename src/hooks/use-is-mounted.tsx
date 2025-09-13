import { useState } from "react";

export default function useIsMounted() {
  // Initialize as true since component is mounted when this hook is called
  const [isMounted] = useState(true);

  return isMounted;
}
