import type React from "react";

import emoji0 from "../../images/emoji0.png";

import commonStyles from "./common.module.scss";
import { useReactionTutorial2 } from "./useReactionTutorial2";

type Props = {
	index: number;
	numberOfSteps: number;
	skipTutorial: () => void;
	run: boolean;
	setRun: React.Dispatch<React.SetStateAction<boolean>>;
	stepIndex: number;
	setStepIndex: React.Dispatch<React.SetStateAction<number>>;
	setShowEffect: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ReactionContainer2: React.FC<Props> = ({
	index,
	numberOfSteps,
	skipTutorial,
	run,
	setRun,
	stepIndex,
	setStepIndex,
	setShowEffect,
}: Props) => {
	useReactionTutorial2({
		index,
		run,
		setRun,
		stepIndex,
		setStepIndex,
		setShowEffect,
	});

	return (
		<div className={commonStyles.tutorialContainer}>
			<div className={commonStyles.iconContainer}>
				<img draggable={false} src={emoji0} alt="emoji0" />
			</div>
			<div className={commonStyles.messageContainer}>
				リアクションアイコンを押してみよう
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
