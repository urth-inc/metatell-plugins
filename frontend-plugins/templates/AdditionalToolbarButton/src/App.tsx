import styles from "./App.module.scss";
import { AdditionalToolbarButton } from "./components/AdditionalToolbarButton";

const App = () => {
	return (
		<div className={styles.appContainer}>
			<h2 className={styles.appHeadingContainer}>
				AdditionalToolbarButton Component
			</h2>
			<AdditionalToolbarButton />
		</div>
	);
};

export default App;
