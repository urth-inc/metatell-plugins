import type React from "react";
import styles from "./App.module.scss";
import { CustomOverlay } from "./components/CustomOverlay";

const App: React.FC = () => {
	return (
		<div className={styles.appContainer}>
			<h2 className={styles.appHeadingContainer}>CustomOverlay Component</h2>
			<CustomOverlay />
		</div>
	);
};

export default App;
