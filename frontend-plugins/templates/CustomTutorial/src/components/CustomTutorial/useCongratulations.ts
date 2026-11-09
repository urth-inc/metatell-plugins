import { useEffect, useRef } from "react";

export const useCongratulations = ({
  index,
  run,
  stepIndex,
  setEffectOption,
  setShowEffect,
}: {
  index: number;
  run: boolean;
  stepIndex: number;
  setEffectOption: (value: "single" | "flow") => void;
  setShowEffect: (value: boolean) => void;
}) => {
  const isProcessingRef = useRef(false);

  useEffect(() => {
    if (!run || index !== stepIndex || isProcessingRef.current) {
      return;
    }

    isProcessingRef.current = true;
    setEffectOption("flow");
    setShowEffect(true);
    window.localStorage.setItem("done_tutorial", "true");
    setTimeout(() => {
      isProcessingRef.current = false;
      setShowEffect(false);
      setEffectOption("single");
    }, 10000);
  }, [setEffectOption, setShowEffect, run, stepIndex, index]);
};
