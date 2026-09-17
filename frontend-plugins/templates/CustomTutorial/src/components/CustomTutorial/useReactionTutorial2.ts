import { useCallback, useEffect, useRef, useState } from "react";

export const useReactionTutorial2 = ({
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
	const [reactionIcon, setReactionIcon] = useState<HTMLElement | null>(null);
	useEffect(() => {
		if (!run || index !== stepIndex) {
			return;
		}

		const element: HTMLElement | null = document.querySelector(
			"[data-mt='ReactionIcon-0']",
		);
		setReactionIcon(element);

		const observer = new MutationObserver(() => {
			const updatedElement = document.querySelector<HTMLElement>(
				"[data-mt='ReactionIcon-0']",
			);
			setReactionIcon(updatedElement);
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});

		return () => {
			observer.disconnect();
		};
	}, [run, stepIndex, index]);

	const isProcessingRef = useRef(false);
	const handleReactionIconClickRef = useRef<() => void>(() => {});
	handleReactionIconClickRef.current = useCallback(() => {
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
			handleReactionIconClickRef.current();
		};

		if (reactionIcon) {
			reactionIcon.addEventListener("click", handleClick);
		}

		return () => {
			if (reactionIcon) {
				reactionIcon.removeEventListener("click", handleClick);
			}
		};
	}, [reactionIcon]);
};
