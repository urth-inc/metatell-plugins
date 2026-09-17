import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Tooltip } from "react-tooltip";
import { AvatarCameraIcon } from "./AvatarCameraIcon";
import { CameraIcon } from "./CameraIcon";
import styles from "./CustomWebCameraButton.module.scss";
import { VideoDisabledIcon } from "./VideoDisabledIcon";
import { VideoEnabledIcon } from "./VideoEnabledIcon";

interface CustomWebCameraButtonProps {
	isSharingCamera: boolean;
	canShareCamera: boolean;
	canShareCameraToAvatar: boolean;
	stopSharingCamera: () => void;
	startSharingCamera: () => void;
	startSharingCameraToAvatar: () => void;
}

export const CustomWebCameraButton: React.FC<CustomWebCameraButtonProps> = ({
	isSharingCamera,
	canShareCamera,
	canShareCameraToAvatar,
	stopSharingCamera,
	startSharingCamera,
	startSharingCameraToAvatar,
}) => {
	const [isOpen, setIsOpen] = useState(false);

	const buttonRef: React.RefObject<HTMLButtonElement> = useRef(null);
	const tooltipRef: React.RefObject<HTMLDivElement> = useRef(null);

	const handleClickOutside = (event: MouseEvent) => {
		const isClickedInsideButton = buttonRef.current?.contains(
			event.target as Node,
		);
		const isClickedInsideTooltip = tooltipRef.current?.contains(
			event.target as Node,
		);

		const isClickedOutside = !isClickedInsideButton && !isClickedInsideTooltip;

		if (isClickedOutside) {
			setIsOpen(false);
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleClickShareCamera = () => {
		startSharingCamera();
		setIsOpen(false);
	};

	const handleClickShareCameraToAvatar = () => {
		startSharingCameraToAvatar();
		setIsOpen(false);
	};

	const handleClickCustomWebCameraButton = () => {
		if (isSharingCamera) {
			stopSharingCamera();
			return;
		}

		if (isOpen) {
			setIsOpen(false);
		} else {
			setIsOpen(true);
		}
	};

	const content = (
		<div className={styles.customWebCameraPopupContainer}>
			<div>Webカメラ</div>
			<div className={styles.actionButtonContainer}>
				{canShareCamera && (
					<button
						type="button"
						className={styles.actionButton}
						onClick={handleClickShareCamera}
					>
						<div className={styles.iconContainer}>
							<CameraIcon />
						</div>
						<div>カメラ</div>
					</button>
				)}
				{canShareCameraToAvatar && (
					<button
						type="button"
						className={styles.actionButton}
						onClick={handleClickShareCameraToAvatar}
					>
						<div className={styles.iconContainer}>
							<AvatarCameraIcon />
						</div>
						<div>アバターカメラ</div>
					</button>
				)}
			</div>
		</div>
	);

	return (
		<>
			<button
				type="button"
				ref={buttonRef}
				id="clickable"
				className={styles.customWebCameraButtonContainer}
				onClick={handleClickCustomWebCameraButton}
			>
				<div className={styles.iconContainer}>
					{isSharingCamera ? <VideoEnabledIcon /> : <VideoDisabledIcon />}
				</div>
				{isSharingCamera ? (
					<div className={styles.customWebCameraButtonLabelText}>Webカメラ</div>
				) : (
					<div className={styles.customWebCameraButtonLabelTextDisabled}>
						Webカメラ
					</div>
				)}
			</button>
			<div ref={tooltipRef}>
				<Tooltip
					anchorSelect="#clickable"
					clickable
					isOpen={isOpen}
					offset={20}
				>
					{content}
				</Tooltip>
			</div>
		</>
	);
};
