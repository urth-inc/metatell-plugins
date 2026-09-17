import type React from "react";
import { useEffect, useState } from "react";
import { Joyride } from "react-joyride";

import { ChatContainer } from "./ChatContainer";
import { CongratulationsContainer } from "./CongratulationsContainer";
import { MicrophoneContainer } from "./MicrophoneContainer";
import { ParticleEffect } from "./ParticleEffect";
import { ReactionContainer } from "./ReactionContainer";
import { ReactionContainer2 } from "./ReactionContainer2";

type Props = {
	showMicrophone: boolean;
	showMegaphone: boolean;
	showVideo: boolean;
	showShare: boolean;
	showPlace: boolean;
	showReaction: boolean;
	showChat: boolean;
};

export const CustomTutorial: React.FC<Props> = ({
	showReaction,
	showMicrophone,
	showChat,
}) => {
	const isFinished = window.localStorage.getItem("done_tutorial") === "true";
	const [run, setRun] = useState(!isFinished);
	const [stepIndex, setStepIndex] = useState(0);
	const [showEffect, setShowEffect] = useState(false);
	const [effectOption, setEffectOption] = useState<"single" | "flow">("single");

	useEffect(() => {
		window.addEventListener("initTutorial", () => {
			setStepIndex(0);
			setRun(true);
		});

		return () => {
			window.removeEventListener("initTutorial", () => {
				setStepIndex(0);
				setRun(true);
			});
		};
	}, [stepIndex]);

	const skipTutorial = () => {
		setRun(false);
		window.localStorage.setItem("done_tutorial", "true");
	};
	const createStep = (
		// eslint-disable-next-line
		Component: React.FC<any>,
		index: number,
		additionalProps = {},
		numberOfSteps: number,
	) => ({
		target: "[data-mt='Toolbar']",
		content: (
			<Component
				index={index}
				numberOfSteps={numberOfSteps}
				skipTutorial={skipTutorial}
				stepIndex={stepIndex}
				run={run}
				setRun={setRun}
				setStepIndex={setStepIndex}
				setShowEffect={setShowEffect}
				{...additionalProps}
			/>
		),
		disableBeacon: true,
	});

	const stepsConfig = [
		{ condition: showReaction, Component: ReactionContainer },
		{ condition: showReaction, Component: ReactionContainer2 },
		{ condition: showMicrophone, Component: MicrophoneContainer },
		{ condition: showChat, Component: ChatContainer },
		{
			condition: true,
			Component: CongratulationsContainer,
			additionalProps: { doneTutorial: skipTutorial, setEffectOption },
		},
	];

	const numberOfSteps: number =
		stepsConfig.filter(({ condition }) => condition).length - 1;
	const steps = stepsConfig
		.filter(({ condition }) => condition)
		.map(({ Component, additionalProps }, index) =>
			createStep(Component, index, additionalProps, numberOfSteps),
		);

	return (
		<div data-mt="TutorialContainer">
			<Joyride
				run={run && numberOfSteps > 0}
				floatingOptions={{ hideArrow: true }}
				options={{
					backgroundColor: "#121212",
					arrowColor: "#FFF",
					textColor: "white",
					// The tour advances when the user performs the action, so no
					// back / close / next buttons are shown.
					buttons: [],
					hideOverlay: true,
					overlayClickAction: false,
					dismissKeyAction: false,
				}}
				steps={steps}
				stepIndex={stepIndex}
				continuous={true}
			/>
			<ParticleEffect show={showEffect} option={effectOption} />
		</div>
	);
};
