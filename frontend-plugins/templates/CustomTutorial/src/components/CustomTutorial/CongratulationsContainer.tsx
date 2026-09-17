import type React from "react";

import commonStyles from "./common.module.scss";
import { useCongratulations } from "./useCongratulations";

type Props = {
	index: number;
	doneTutorial: () => void;
	stepIndex: number;
	run: boolean;
	setShowEffect: React.Dispatch<React.SetStateAction<boolean>>;
	setEffectOption: React.Dispatch<React.SetStateAction<"single" | "flow">>;
};

export const CongratulationsContainer: React.FC<Props> = ({
	index,
	doneTutorial,
	run,
	stepIndex,
	setEffectOption,
	setShowEffect,
}: Props) => {
	useCongratulations({
		index,
		run,
		stepIndex,
		setEffectOption,
		setShowEffect,
	});

	return (
		<div className={commonStyles.tutorialContainer}>
			<div className={commonStyles.messageContainer}>
				<div>おめでとうございます🎉</div>
				<div>すべてのチュートリアルが完了しました。</div>
			</div>
			<button
				type="button"
				onClick={doneTutorial}
				className={commonStyles.skipButton}
			>
				完了
			</button>
		</div>
	);
};
