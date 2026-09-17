import type React from "react";

import styles from "./CustomExitScreen.module.css";

export const ExitReason = {
	exited: "exited",
	closed: "closed",
	denied: "denied",
	kicked: "kicked",
	left: "left",
	connectError: "connectError",
	sceneError: "sceneError",
} as const;

export type ExitReasonType = (typeof ExitReason)[keyof typeof ExitReason];

export type ExitScreenContent = {
	title: string;
	message: string;
	buttonLabel: string;
	buttonUrl?: string;
};

export type ExitScreenContentByReason = Record<
	ExitReasonType,
	ExitScreenContent
>;

export type CustomExitScreenProps = {
	reason: ExitReasonType;
	contentByReason: ExitScreenContentByReason;
	onPrimaryAction: () => void;
	logoUrl?: string;
};

export const mfMeta = {
	type: "CustomExitScreen",
	contractVersion: 1,
	supportedReasons: [
		"exited",
		"closed",
		"denied",
		"kicked",
		"left",
		"connectError",
		"sceneError",
	] as const,
};

export const CustomExitScreen: React.FC<CustomExitScreenProps> = ({
	reason,
	contentByReason,
	onPrimaryAction,
	logoUrl,
}) => {
	const content = contentByReason[reason];

	return (
		<div className={styles.root} data-reason={reason}>
			{logoUrl && <img src={logoUrl} alt="Logo" className={styles.logo} />}
			<section className={styles.container}>
				<h2 className={styles.title}>{content.title}</h2>
				<p className={styles.message}>{content.message}</p>
				<button
					className={styles.button}
					type="button"
					onClick={onPrimaryAction}
				>
					{content.buttonLabel}
				</button>
			</section>
		</div>
	);
};

export default CustomExitScreen;
