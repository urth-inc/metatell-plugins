import type React from "react";
import { useState } from "react";

import { CustomChatModal } from "../CustomChatModal";
import styles from "./CustomChatButton.module.scss";
import { SampleIcon } from "./SampleIcon";

type MessageGroup = {
	id: number;
	type:
		| "chat"
		| "join"
		| "entered"
		| "leave"
		| "display_name_changed"
		| "hub_name_changed";
	timestamp: number;
	sender?: string;
	senderSessionId?: string;
	messages?: {
		id: number;
		body: string;
		timestamp: number;
	}[];
	name?: string;
	presence?: string;
	hubName?: string;
	oldName?: string;
	newName?: string;
};

interface CustomChatButtonProps {
	toggleDefaultModal: () => void;
	canSpawnMessages: boolean;
	onUploadFiles: (event: React.ChangeEvent<HTMLInputElement>) => void;
	spawnChatMessage: (message: string) => void;
	sendMessage: (message: string) => void;
	messageGroups: MessageGroup[];
}

export const CustomChatButton: React.FC<CustomChatButtonProps> = ({
	toggleDefaultModal,
	canSpawnMessages,
	onUploadFiles,
	spawnChatMessage,
	sendMessage,
	messageGroups,
}) => {
	const [modalIsOpen, setIsOpen] = useState<boolean>(false);
	const openModal = () => {
		setIsOpen(true);
	};
	const closeModal = () => {
		setIsOpen(false);
	};

	const handleClick = () => {
		// toggleDefaultModal();
		openModal();
	};

	return (
		<>
			<CustomChatModal
				modalIsOpen={modalIsOpen}
				closeModal={closeModal}
				sendMessage={sendMessage}
				messageGroups={messageGroups}
				canSpawnMessages={canSpawnMessages}
				onUploadFiles={onUploadFiles}
				spawnChatMessage={spawnChatMessage}
			/>
			<button
				type="button"
				className={styles.customLeaveButtonContainer}
				onClick={handleClick}
			>
				<div className={styles.sampleIconContainer}>
					<SampleIcon />
				</div>
				<div className={styles.customLeaveButtonLabel}>Chat</div>
			</button>
		</>
	);
};
