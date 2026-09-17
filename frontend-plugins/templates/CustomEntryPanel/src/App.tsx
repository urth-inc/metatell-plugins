import type React from "react";
import styles from "./App.module.scss";
import { CustomEntryPanel } from "./components/CustomEntryPanel";

const App: React.FC = () => {
	const dummyProps = {
		roomName: "Room Name",
		logoUrl:
			"https://r2.u-rth.win/room-entrance-files/893e4f7d-43b2-4efd-be29-6bd695841a3c.jpeg",
		showJoinRoom: true,
		isRoomFull: false,
		onJoinRoom: () => {
			console.log("Join Room Clicked");
		},
		showEnterOnDevice: true,
		onEnterOnDevice: () => {
			console.log("Enter On Device Clicked");
		},
		showSpectate: true,
		onSpectate: () => {
			console.log("Spectate Clicked");
		},
		showOptions: true,
		onOptions: () => {
			console.log("Options Clicked");
		},
		leftImage: (
			<img
				src="https://r2.u-rth.win/room-entrance-files/893e4f7d-43b2-4efd-be29-6bd695841a3c.jpeg"
				alt="left image"
			/>
		),
		rightImage: (
			<img
				src="https://r2.u-rth.win/room-entrance-files/893e4f7d-43b2-4efd-be29-6bd695841a3c.jpeg"
				alt="right image"
			/>
		),
		leftMessage: "Left Message",
		rightMessage: "Right Message",
		termsOfServiceUrl: "https://www.google.com",
		privacyPolicyUrl: "https://www.google.com",
	};

	return (
		<div className={styles.appContainer}>
			<h2 className={styles.appHeadingContainer}>CustomEntryPanel Component</h2>
			<CustomEntryPanel {...dummyProps} />
		</div>
	);
};

export default App;
