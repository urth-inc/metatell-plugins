import type React from "react";
import commonStyles from "./common.module.scss";
import { MicrophoneIcon } from "./icons/MicrophoneIcon";
import { MicrophoneMutedIcon } from "./icons/MicrophoneMutedIcon";
import styles from "./MicrophoneContainer.module.scss";
import { useMicrophoneTutorial } from "./useMicrophoneTutorial";

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

export const MicrophoneContainer: React.FC<Props> = ({
	index,
	numberOfSteps,
	skipTutorial,
	stepIndex,
	run,
	setRun,
	setStepIndex,
	setShowEffect,
}: Props) => {
	useMicrophoneTutorial({
		index,
		run,
		setRun,
		stepIndex,
		setStepIndex,
		setShowEffect,
	});
	return (
		<div className={commonStyles.tutorialContainer}>
			<div className={styles.micIconContainer}>
				<MicrophoneMutedIcon />
				<div className={styles.triangle}></div>
				<MicrophoneIcon />
			</div>
			<div className={commonStyles.messageContainer}>
				マイクをオンにして近くの人に話しかけてみよう
			</div>
			<div
				className={commonStyles.progressContainer}
			>{`${(index + 1).toString()}/${numberOfSteps}`}</div>
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
