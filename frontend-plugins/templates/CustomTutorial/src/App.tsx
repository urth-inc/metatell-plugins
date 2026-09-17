import type React from "react";
import styles from "./App.module.scss";
import { CustomTutorial } from "./components/CustomTutorial";

const tutorialProps = {
	showMicrophone: true,
	showMegaphone: true,
	showVideo: true,
	showShare: true,
	showPlace: true,
	showReaction: true,
	showChat: true,
};

const App: React.FC = () => {
	const handleClick = () => {
		window.dispatchEvent(new CustomEvent("initTutorial"));
	};

	return (
		<div className={styles.appContainer}>
			<h2 className={styles.appHeadingContainer}>CustomTutorial Demo</h2>
			<CustomTutorial {...tutorialProps} />
			<div data-mt="ReactionIcon-0" className={styles.dummyIconContainer}>
				ReactionIcon
			</div>
			<div data-mt="Toolbar" className={styles.dummyToolbarContainer}>
				<div className={styles.dummyToolbarItem} data-mt="ToolbarMicButton">
					Microphone
				</div>
				<div
					className={styles.dummyToolbarItem}
					data-mt="ReactionPopoverContainer"
				>
					Reaction
				</div>
				<div
					className={styles.dummyToolbarItem}
					data-mt="ChatToolbarButtonContainer"
				>
					Chat
				</div>
			</div>
			<div className={styles.startTutorialButtonContainer}>
				<button type="button" onClick={handleClick}>
					Start Tutorial
				</button>
			</div>
		</div>
	);
};

export default App;
