import type React from "react";
import styles from "./App.module.scss";
import { CustomLeaveButton } from "./components/CustomLeaveButton";

const App: React.FC = () => {
	return (
		<div className={styles.appContainer}>
			<h2 className={styles.appHeadingContainer}>
				CustomLeaveButton Component
			</h2>
			<CustomLeaveButton showDefaultModal={() => {}} destinationUrl="" />
		</div>
	);
};

export default App;
