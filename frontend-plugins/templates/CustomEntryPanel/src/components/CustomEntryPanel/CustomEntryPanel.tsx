import type React from "react";
import { useCallback, useState } from "react";
import { useCssBreakpoints } from "react-use-css-breakpoints";
import styles from "./CustomEntryPanel.module.scss";

interface CustomEntryPanelProps {
	roomName: string | undefined;
	logoUrl: string | undefined;
	showJoinRoom: boolean;
	isRoomFull: boolean;
	onJoinRoom: () => void;
	showEnterOnDevice: boolean;
	onEnterOnDevice: () => void;
	showSpectate: boolean;
	onSpectate: () => void;
	showOptions: boolean;
	onOptions: () => void;
	leftImage: React.ReactNode;
	rightImage: React.ReactNode;
	leftMessage: string;
	rightMessage: string;
	termsOfServiceUrl: string | undefined;
	privacyPolicyUrl: string | undefined;
}

export const CustomEntryPanel: React.FC<CustomEntryPanelProps> = ({
	roomName,
	logoUrl,
	showJoinRoom,
	isRoomFull,
	onJoinRoom,
	showEnterOnDevice,
	onEnterOnDevice,
	showSpectate,
	onSpectate,
	showOptions,
	onOptions,
	leftImage,
	rightImage,
	leftMessage,
	rightMessage,
	termsOfServiceUrl,
	privacyPolicyUrl,
}) => {
	const breakpoint = useCssBreakpoints();

	const [agreeToTerms, setAgreeToTerms] = useState(false);
	const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);

	const handleAgreeToTerms = () => {
		setAgreeToTerms(!agreeToTerms);
	};
	const handleAgreeToPrivacy = () => setAgreeToPrivacy(!agreeToPrivacy);

	const isButtonDisabled = () => {
		if (termsOfServiceUrl && !agreeToTerms) return true;
		if (privacyPolicyUrl && !agreeToPrivacy) return true;
		return false;
	};

	return (
		<div className={styles.tempWrapper}>
			{/* TODO: Implement your custom entry panel here */}
			<div className={styles.modal}>
				<div className={styles.modalContent}>
					<div className={`${styles.container} ${styles.keyboard}`}>
						<div>
							<p>
								{leftMessage ? leftMessage : <div>デフォルトメッセージ</div>}
							</p>
						</div>
						<div>{leftImage}</div>
					</div>

					<div className={`${styles.container} ${styles.mouse}`}>
						<div>
							<div>{rightImage}</div>
						</div>
						<div>
							<p>
								{rightMessage ? rightMessage : <div>デフォルトメッセージ</div>}
							</p>
						</div>
					</div>

					<div
						className={`${styles.column} ${styles.center} ${styles.centerContent}`}
					>
						{breakpoint !== "sm" && breakpoint !== "md" && (
							<div className={styles.logoContainer}>
								<img src={logoUrl} alt="logo" />
							</div>
						)}

						<div className={styles.roomName}>
							<p>{roomName}</p>
						</div>

						<div className={`${styles.column} ${styles.center}`}>
							{(termsOfServiceUrl || privacyPolicyUrl) && (
								<div style={{ marginBottom: "16px" }}>
									{termsOfServiceUrl && (
										<div className={styles.termsCheckboxBlock}>
											<label className={styles.checkboxInput}>
												<input
													type="checkbox"
													checked={agreeToTerms}
													onChange={handleAgreeToTerms}
												/>
												<div className={styles.checkmark} />
												<div className={styles.labelContainer}>
													<p>
														<a
															className={styles.customA}
															href={termsOfServiceUrl}
															target="_blank"
															rel="noopener noreferrer"
														>
															利用規約
														</a>
														に同意する
													</p>
												</div>
											</label>
										</div>
									)}

									{privacyPolicyUrl && (
										<div className={styles.termsCheckboxBlock}>
											<label className={styles.checkboxInput}>
												<input
													type="checkbox"
													checked={agreeToPrivacy}
													onChange={handleAgreeToPrivacy}
												/>
												<div className={styles.checkmark} />
												<div className={styles.labelContainer}>
													<p>
														<a
															className={styles.customA}
															href={termsOfServiceUrl}
															target="_blank"
															rel="noopener noreferrer"
														>
															プライバシーポリシー
														</a>
														に同意する
													</p>
												</div>
											</label>
										</div>
									)}
								</div>
							)}

							{showJoinRoom && (
								<button
									type="button"
									className={`${styles.buttonCommon} ${styles.accent4}`}
									onClick={onJoinRoom}
									disabled={isButtonDisabled()}
								>
									<span>
										<div>ルームに入る</div>
									</span>
								</button>
							)}

							{showEnterOnDevice && (
								<button
									type="button"
									className={`${styles.buttonCommon} ${styles.accent5}`}
									onClick={onEnterOnDevice}
									disabled={isButtonDisabled()}
								>
									<span>
										<div>VRヘッドセットで入る</div>
									</span>
								</button>
							)}

							{showSpectate && (
								<button
									type="button"
									className={`${styles.buttonCommon} ${styles.accent2}`}
									onClick={onSpectate}
									disabled={isButtonDisabled()}
								>
									<span>
										<div>ツアーに参加する</div>
									</span>
								</button>
							)}

							{isRoomFull && (
								<div className={styles["full-room-description-container"]}>
									<p>只今満員のため、他の方が退室されるまでお待ちください。</p>
									<p>
										入室可能になりましたらボタンが表示されますので入室ください。
									</p>
								</div>
							)}

							{showOptions && breakpoint !== "sm" && (
								<>
									<hr className={styles.customHr} />
									<button
										type="button"
										className={`${styles.buttonCommon} ${styles.transparent}`}
										onClick={onOptions}
									>
										<span>
											<div>ルームの設定</div>
										</span>
									</button>
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
