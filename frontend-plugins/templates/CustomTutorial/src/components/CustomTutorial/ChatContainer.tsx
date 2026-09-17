import type React from "react";
import styles from "./ChatContainer.module.scss";
import commonStyles from "./common.module.scss";
import { ChatIcon } from "./icons/ChatIcon";
import { useChatTutorial } from "./useChatTutorial";

type Props = {
	index: number;
	numberOfSteps: number;
	skipTutorial: () => void;
	stepIndex: number;
	run: boolean;
	setRun: React.Dispatch<React.SetStateAction<boolean>>;
	setStepIndex: React.Dispatch<React.SetStateAction<number>>;
	setShowEffect: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ChatContainer: React.FC<Props> = ({
	index,
	numberOfSteps,
	skipTutorial,
	stepIndex,
	run,
	setRun,
	setStepIndex,
	setShowEffect,
}: Props) => {
	useChatTutorial({
		index,
		run,
		setRun,
		stepIndex,
		setStepIndex,
		setShowEffect,
	});

	return (
		<div className={commonStyles.tutorialContainer}>
			<div className={styles.chatIconContainer}>
				<ChatIcon />
				<div className={styles.chatIconText}>Chat</div>
			</div>
			<div className={commonStyles.messageContainer}>
				チャットで空間内の人に挨拶をしてみよう
			</div>
			<div
				className={commonStyles.progressContainer}
			>{`${(index + 1).toString()}/${numberOfSteps.toString()}`}</div>
			<button
				type="button"
				onClick={skipTutorial}
				className={commonStyles.skipButton}
			>
				スキップ
			</button>
		</div>
	);
};
