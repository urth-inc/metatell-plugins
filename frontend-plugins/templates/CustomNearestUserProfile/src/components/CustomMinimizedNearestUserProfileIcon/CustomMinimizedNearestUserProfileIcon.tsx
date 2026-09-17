import classNames from "classnames";
import type React from "react";
import styles from "./CustomMinimizedNearestUserProfileIcon.module.scss";
import { SpeakerIcon } from "./SpeakerIcon";

type Props = {
	onClick: () => void;
	showSpeakerIcon: boolean;
};

export const CustomMinimizedNearestUserProfileIcon: React.FC<Props> = ({
	onClick,
	showSpeakerIcon,
}) => {
	return (
		<button
			type="button"
			className={classNames(
				styles.menuButtonContainer,
				!showSpeakerIcon && styles.hidden,
			)}
			onClick={onClick}
		>
			<SpeakerIcon />
		</button>
	);
};
