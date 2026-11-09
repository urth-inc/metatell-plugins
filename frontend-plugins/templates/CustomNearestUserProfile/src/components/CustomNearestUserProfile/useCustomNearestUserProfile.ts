import React, { useCallback } from "react";

export const useCustomNearestUserProfile = () => {
  const [minimized, setMinimized] = React.useState(false);

  const minimizeModal = useCallback(() => {
    setMinimized(true);
  }, []);

  const openModal = useCallback(() => {
    setMinimized(false);
  }, []);

  return {
    minimized,
    minimizeModal,
    openModal,
  };
};
