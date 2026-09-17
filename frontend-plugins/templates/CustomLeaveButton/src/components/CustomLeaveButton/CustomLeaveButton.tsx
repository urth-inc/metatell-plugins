import type React from "react";
import { useState } from "react";

import { CustomLeaveModal } from "../CustomLeaveModal";
import styles from "./CustomLeaveButton.module.scss";
import { SampleIcon } from "./SampleIcon";

interface CustomLeaveButtonProps {
	showDefaultModal: () => void;
	destinationUrl: string;
}

export const CustomLeaveButton: React.FC<CustomLeaveButtonProps> = ({
	showDefaultModal,
	destinationUrl,
}) => {
	const [modalIsOpen, setIsOpen] = useState<boolean>(false);
	const openModal = () => {
		setIsOpen(true);
	};
	const closeModal = () => {
		setIsOpen(false);
	};

	const handleClick = () => {
		// showDefaultModal();
		openModal();
	};

	return (
		<>
			<CustomLeaveModal modalIsOpen={modalIsOpen} closeModal={closeModal} />
			<button
				type="button"
				className={styles.customLeaveButtonContainer}
				onClick={handleClick}
			>
				<div className={styles.sampleIconContainer}>
					<SampleIcon />
				</div>
				<div className={styles.customLeaveButtonLabel}>Leave</div>
			</button>
		</>
	);
};
