import React from "react";
import styles from "./App.module.scss";
import { CustomProfileModal } from "./components/CustomProfileModal";

const App: React.FC = () => {
	const [isOpen, setIsOpen] = React.useState(false);
	const dummyProps = {
		isOpen,
		onClose: () => setIsOpen(false),
		displayName: "John Doe",
		bio: "Hello, I'm John Doe.",
		avatarId: "1",
		avatarThumbnailUrl: undefined,
		selectedAvatarId: "1",
		selectedAvatarThumbnailUrl: undefined,
		openAvatarSelectModal: () => console.log("Open Avatar Select Modal"),
		saveProfile: ({
			displayName,
			bio,
			avatarId,
		}: {
			displayName?: string;
			bio?: string;
			avatarId?: string;
		}) => {
			console.log({ displayName, bio, avatarId });
		},
	};

	return (
		<div className={styles.appContainer}>
			<h2 className={styles.appHeadingContainer}>CustomEntryPanel Component</h2>
			<button
				type="button"
				onClick={() => {
					setIsOpen(true);
				}}
			>
				Open Modal
			</button>
			<CustomProfileModal {...dummyProps} />
		</div>
	);
};

export default App;
