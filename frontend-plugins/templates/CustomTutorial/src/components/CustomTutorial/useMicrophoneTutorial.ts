import { useCallback, useEffect, useRef } from "react";

export const useMicrophoneTutorial = ({
	index,
	run,
	setRun,
	stepIndex,
	setStepIndex,
	setShowEffect,
}: {
	index: number;
	run: boolean;
	setRun: React.Dispatch<React.SetStateAction<boolean>>;
	stepIndex: number;
	setStepIndex: React.Dispatch<React.SetStateAction<number>>;
	setShowEffect: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const microphoneButton: HTMLElement | null = document.querySelector(
		"[data-mt='ToolbarMicButton']",
	);

	const handleMicrophoneButtonClickRef = useRef<() => void>(() => {});
	const isProcessingRef = useRef(false);

	handleMicrophoneButtonClickRef.current = useCallback(() => {
		if (!run || index !== stepIndex || isProcessingRef.current) {
			return;
		}

		isProcessingRef.current = true;
		setShowEffect(true);
		setStepIndex(index + 1);
		setRun(false);
		setTimeout(() => {
			isProcessingRef.current = false;
			setShowEffect(false);
			setRun(true);
		}, 2000);
	}, [run, stepIndex, setStepIndex, setShowEffect, index]);

	useEffect(() => {
		const handleClick = () => {
			handleMicrophoneButtonClickRef.current();
		};

		if (microphoneButton) {
			microphoneButton.addEventListener("click", handleClick);
		}

		return () => {
			if (microphoneButton) {
				microphoneButton.removeEventListener("click", handleClick);
			}
		};
	}, [microphoneButton]);
};
