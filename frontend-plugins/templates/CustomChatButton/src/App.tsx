import type React from "react";
import styles from "./App.module.scss";
import { CustomChatButton } from "./components/CustomChatButton";

const App: React.FC = () => {
	const dummyProps = {
		toggleDefaultModal: () => {
			console.log("Toggle Default Modal Clicked");
		},
		canSpawnMessages: true,
		onUploadFiles: (event: React.ChangeEvent<HTMLInputElement>) => {
			console.log(event.target.files);
		},
		spawnChatMessage: (message: string) => {
			console.log("Spawn Chat Message", message);
		},
		sendMessage: (message: string) => {
			console.log("Send Message", message);
		},
		messageGroups: [],
	};

	return (
		<div className={styles.appContainer}>
			<h2 className={styles.appHeadingContainer}>CustomChatButton Component</h2>
			<CustomChatButton {...dummyProps} />
		</div>
	);
};

export default App;
