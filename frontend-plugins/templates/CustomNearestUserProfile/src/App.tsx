import type React from "react";
import styles from "./App.module.scss";
import sampleImage from "./assets/penguin.png";
import { CustomNearestUserProfile } from "./components/CustomNearestUserProfile";

import type { User } from "./types/user";

const sampleUser: User = {
	sessionId: "dummy-session-id",
	displayName: "John Doe",
	biography: "I am a software engineer.",
	avatarThumbnailUrl: sampleImage,
	distance: 4,
};

const App: React.FC = () => {
	return (
		<div className={styles.appContainer}>
			<h2 className={styles.appHeadingContainer}>
				CustomNearestUserProfile Component
			</h2>
			<CustomNearestUserProfile user={sampleUser} />
		</div>
	);
};

export default App;
