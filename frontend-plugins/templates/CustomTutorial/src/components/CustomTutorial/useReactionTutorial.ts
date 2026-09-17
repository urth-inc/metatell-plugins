import { useCallback, useEffect, useRef } from "react";

export const useReactionTutorial = ({
	run,
	index,
	stepIndex,
	setStepIndex,
	setShowEffect,
	setRun,
}: {
	run: boolean;
	index: number;
	stepIndex: number;
	setStepIndex: React.Dispatch<React.SetStateAction<number>>;
	setShowEffect: React.Dispatch<React.SetStateAction<boolean>>;
	setRun: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const reactionButton: HTMLElement | null = document.querySelector(
		"[data-mt='ReactionPopoverContainer']",
	);

	const isProcessingRef = useRef(false);
	const handleReactionButtonClickRef = useRef<() => void>(() => {});
	handleReactionButtonClickRef.current = useCallback(() => {
		if (!run || index !== stepIndex || isProcessingRef.current) {
			return;
		}

		isProcessingRef.current = true;
		setShowEffect(true);
		setRun(false);

		setTimeout(() => {
			isProcessingRef.current = false;
			setShowEffect(false);
			setStepIndex(index + 1);
			setRun(true);
		}, 2000);
	}, [run, stepIndex, setStepIndex, setShowEffect, index]);

	useEffect(() => {
		const handleClick = () => {
			handleReactionButtonClickRef.current();
		};

		if (reactionButton) {
			reactionButton.addEventListener("click", handleClick);
		}

		return () => {
			if (reactionButton) {
				reactionButton.removeEventListener("click", handleClick);
			}
		};
	}, [reactionButton]);
};
