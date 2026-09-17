import type React from "react";
import { useState } from "react";
import Modal from "react-modal";

import styles from "./CustomProfileModal.module.scss";

Modal.setAppElement("#ui-root");

interface CustomProfileModalProps {
	isOpen: boolean;
	onClose: () => void;
	displayName: string;
	bio: string;
	avatarId: string | undefined;
	avatarThumbnailUrl: string | undefined;
	selectedAvatarId: string | undefined;
	selectedAvatarThumbnailUrl: string | undefined;
	openAvatarSelectModal: () => void;
	saveProfile: ({
		displayName,
		bio,
		avatarId,
	}: {
		displayName?: string;
		bio?: string;
		avatarId?: string;
	}) => void;
}

export const CustomProfileModal: React.FC<CustomProfileModalProps> = ({
	isOpen,
	onClose,
	displayName,
	bio,
	avatarId,
	openAvatarSelectModal,
	avatarThumbnailUrl,
	selectedAvatarId,
	selectedAvatarThumbnailUrl,
	saveProfile,
}) => {
	const [displayNameInput, setDisplayNameInput] = useState<string>(displayName);
	const handleDisplayNameInputChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		setDisplayNameInput(event.target.value);
	};

	const [bioInput, setBioInput] = useState<string>(bio);
	const handleBioInputChange = (
		event: React.ChangeEvent<HTMLTextAreaElement>,
	) => {
		setBioInput(event.target.value);
	};

	return (
		<Modal
			isOpen={isOpen}
			onRequestClose={onClose}
			className={styles.modalContent}
			overlayClassName={styles.modalOverlay}
		>
			<div className={styles.modalContentWrapper}>
				<div className={styles.modalHeader}>
					<div className={styles.beforeTitle}>
						<button
							type="button"
							className={styles.iconButton}
							onClick={onClose}
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 20 20"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M17 17 3 3"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								></path>
								<path
									d="M17 3 3 17"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								></path>
							</svg>
						</button>
					</div>
					<h5>アバター設定</h5>
				</div>

				<div className={styles.modalBody}>
					<form className={styles.formContent}>
						<div className={styles.inputField}>
							<label className={styles.inputFieldLabel}>ニックネーム</label>
							<div className={styles.inputOuterWrapper}>
								<div className={styles.textInputWrapper}>
									<input
										className={styles.textInput}
										value={displayNameInput}
										onChange={handleDisplayNameInputChange}
									/>
								</div>
							</div>
							<div className={styles.inputFieldInfo}>
								32文字以下で入力してください。絵文字は使用できません。
							</div>
						</div>

						<div className={styles.inputField}>
							<label className={styles.inputFieldLabel}>プロフィール</label>
							<div className={`${styles.inputOuterWrapper} ${styles.textArea}`}>
								<div className={styles.textInputWrapper}>
									<textarea
										className={styles.textInput}
										placeholder="あなたのことについて書きましょう"
										value={bioInput}
										onChange={handleBioInputChange}
									></textarea>
								</div>
							</div>
							<div
								className={styles.textAreaFieldInfo}
							>{`${bioInput ? bioInput.length : 0}/${300}`}</div>
						</div>

						<div className={styles.avatarPreviewContainer}>
							<div className={styles.avatarPreview}>
								{avatarThumbnailUrl === undefined ? (
									<div className={styles.avatarLoading}>
										<p>Loading...</p>
									</div>
								) : (
									<img
										className={styles.avatarImg}
										src={selectedAvatarThumbnailUrl ?? avatarThumbnailUrl}
										alt="avatar"
									/>
								)}
								<button
									type="button"
									className={`${styles.button} ${styles.basic}`}
									onClick={openAvatarSelectModal}
								>
									アバターを変更
								</button>
							</div>
							<button
								type="button"
								className={`${styles.button} ${styles.accept}`}
								onClick={() => {
									saveProfile({
										displayName: displayNameInput,
										bio: bioInput,
										avatarId: selectedAvatarId,
									});
									onClose();
								}}
							>
								変更を保存
							</button>
						</div>
					</form>
				</div>
			</div>
		</Modal>
	);
};
