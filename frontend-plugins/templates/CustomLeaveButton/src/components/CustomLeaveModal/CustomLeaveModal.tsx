import type React from "react";
import Modal from "react-modal";

import styles from "./CustomLeaveModal.module.scss";

Modal.setAppElement("#ui-root");

type Props = {
	modalIsOpen: boolean;
	closeModal: () => void;
};

export const CustomLeaveModal: React.FC<Props> = ({
	modalIsOpen,
	closeModal,
}) => {
	return (
		<Modal
			isOpen={modalIsOpen}
			onRequestClose={closeModal}
			className={styles.modalContent}
			overlayClassName={styles.modalOverlay}
		>
			<div className={styles.modalHeader}>
				<div className={styles.modalTitle}>Example Modal</div>
			</div>

			<div className={styles.modalBody}>
				<p>This is a example Modal for demo</p>
			</div>
		</Modal>
	);
};
