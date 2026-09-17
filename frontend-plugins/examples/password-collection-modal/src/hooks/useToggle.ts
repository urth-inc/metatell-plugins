import { useState, useCallback } from "react";

export const useToggle = (initialState: boolean) => {
  const [state, setState] = useState<boolean>(initialState);

  const toggle = useCallback(() => {
    setState((s) => !s);
  }, []);

  return [state, toggle] as const;
};
