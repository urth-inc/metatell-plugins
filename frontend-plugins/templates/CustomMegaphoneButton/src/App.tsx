import React from "react";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import styles from "./App.module.scss";
import { CustomMegaphoneButton } from "./components/CustomMegaphoneButton";

const App: React.FC = () => {
	const [isActiveMegaphone, setIsActiveMegaphone] = React.useState(false);
	const [canMegaphone, setCanMegaphone] = React.useState(true);

	const unmuteMegaphone = async () => {
		setIsActiveMegaphone(true);
	};
	const muteMegaphone = async () => {
		setIsActiveMegaphone(false);
	};
	const mySessionId = "session-123";
	const messageDispatch: EventTarget = new EventTarget();
	const temporalMegaphone = false;
	const requestMegaphone = () => {
		console.log("Requesting megaphone");
	};
	const grantMegaphone = async () => {
		console.log("Granting megaphone");
	};
	const revokeMegaphone = async () => {
		console.log("Revoking megaphone");
	};
	const approveMegaphoneRequest = (sessionId: string) => {
		console.log("Approving megaphone request for session", sessionId);
	};

	const props = {
		canMegaphone,
		isActiveMegaphone,
		muteMegaphone,
		unmuteMegaphone,
		mySessionId,
		messageDispatch,
		temporalMegaphone,
		requestMegaphone,
		grantMegaphone,
		revokeMegaphone,
		approveMegaphoneRequest,
	};

	const handleClickRequestMegaphone = () => {
		messageDispatch.dispatchEvent(
			new CustomEvent("message", {
				detail: {
					type: "request_megaphone",
					name: "John Doe",
					sessionId: "session-456",
				},
			}),
		);
	};

	const handleToggle = () => {
		setCanMegaphone(!canMegaphone);
	};

	return (
		<div className={styles.appContainer}>
			<ToastContainer />

			<h2 className={styles.appHeadingContainer}>CustomMegaphoneButton Demo</h2>
			<CustomMegaphoneButton {...props} />
			<div className={styles.buttonContainer}>
				<button
					type="button"
					className={`${styles.toggleSwitch} ${canMegaphone ? styles.on : styles.off}`}
					aria-pressed={canMegaphone}
					onClick={handleToggle}
				>
					{canMegaphone ? "ON" : "OFF"}
				</button>
			</div>
			<div className={styles.buttonContainer}>
				<button type="button" onClick={handleClickRequestMegaphone}>
					Request Megaphone
				</button>
			</div>
		</div>
	);
};

export default App;
