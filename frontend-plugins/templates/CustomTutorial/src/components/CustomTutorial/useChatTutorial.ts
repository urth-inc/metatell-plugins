import { useCallback, useEffect, useRef } from "react";

export const useChatTutorial = ({
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
	const chatButton: HTMLElement | null = document.querySelector(
		"[data-mt='ChatToolbarButtonContainer']",
	);
	const handleChatButtonClickRef = useRef<() => void>(() => {});

	const isProcessingRef = useRef(false);
	handleChatButtonClickRef.current = useCallback(() => {
		if (!run || index !== stepIndex || isProcessingRef.current) {
			return;
		}

		isProcessingRef.current = true;
		setShowEffect(true);
		setRun(false);
		setTimeout(() => {
			setShowEffect(false);
			isProcessingRef.current = false;
			setStepIndex(index + 1);
			setRun(true);
		}, 2000);
	}, [run, stepIndex, setStepIndex, setShowEffect, index]);

	useEffect(() => {
		const handleClick = () => {
			handleChatButtonClickRef.current();
		};

		if (chatButton) {
			chatButton.addEventListener("click", handleClick);
		}

		return () => {
			if (chatButton) {
				chatButton.removeEventListener("click", handleClick);
			}
		};
	}, [chatButton]);
};
