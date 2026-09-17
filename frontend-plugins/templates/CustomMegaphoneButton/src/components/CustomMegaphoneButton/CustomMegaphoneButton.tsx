import classNames from "classnames";
import type React from "react";
import { useCallback, useState } from "react";
import { Tooltip } from "react-tooltip";

import { MegaphoneIcon } from "../MegaphoneIcon";
import { OffMegaphoneIcon } from "../OffMegaphoneIcon";

import styles from "./CustomMegaphoneButton.module.scss";
import { useMegaphoneMessage } from "./useMegaphoneMessage";

type Props = {
	canMegaphone: boolean;
	isActiveMegaphone: boolean;
	muteMegaphone: () => Promise<void>;
	unmuteMegaphone: () => Promise<void>;
	mySessionId: string | undefined;
	messageDispatch: EventTarget;
	temporalMegaphone: boolean;
	requestMegaphone: () => void;
	grantMegaphone: () => Promise<void>;
	revokeMegaphone: () => Promise<void>;
	approveMegaphoneRequest: (sessionId: string) => void;
};

export const CustomMegaphoneButton: React.FC<Props> = ({
	canMegaphone,
	isActiveMegaphone,
	muteMegaphone,
	unmuteMegaphone,
	mySessionId,
	messageDispatch,
	temporalMegaphone,
	requestMegaphone,
	grantMegaphone,
	revokeMegaphone,
	approveMegaphoneRequest,
}) => {
	const [sentMegaphoneRequest, setSentMegaphoneRequest] = useState(false);
	const revokeWrapper = async () => {
		await revokeMegaphone();
		setSentMegaphoneRequest(false);
	};

	useMegaphoneMessage({
		mySessionId,
		messageDispatch,
		canMegaphone,
		temporalMegaphone,
		revokeMegaphone: revokeWrapper,
		grantMegaphone,
		approveMegaphoneRequest,
	});

	const hasMegaphone = canMegaphone || temporalMegaphone;
	const toggleIsActive = useCallback(async () => {
		if (isActiveMegaphone) {
			await muteMegaphone().catch((error) => {
				console.error("Failed to mute megaphone", error);
			});
		} else {
			await unmuteMegaphone().catch((error) => {
				console.error("Failed to unmute megaphone", error);
			});
		}
	}, [isActiveMegaphone]);

	const onClick = () => {
		requestMegaphone();
		setSentMegaphoneRequest(true);
	};

	if (!hasMegaphone) {
		return (
			<>
				<Tooltip anchorSelect="#clickable" clickable>
					<div className={styles.megaphoneTooltipContainer}>
						<p>権限がないためメガホン機能を使用することができません。</p>
						<p>下記の申請ボタンからメガホン権限を申請することができます。</p>
						<button
							type="button"
							onClick={onClick}
							className={classNames(styles.applicationButton, {
								[`${styles.disabledButton}`]: sentMegaphoneRequest,
							})}
							disabled={sentMegaphoneRequest}
						>
							{sentMegaphoneRequest ? "申請済みです" : "申請する"}
						</button>
					</div>
				</Tooltip>
				<button
					type="button"
					id="clickable"
					className={classNames(
						styles.megaphoneButtonContainer,
						`${styles.disabled}`,
					)}
					disabled
					data-tooltip-offset={20}
				>
					<div className={styles.megaphoneIconContainer}>
						<OffMegaphoneIcon />
					</div>
					<div className={styles.megaphoneButtonLabel}>メガホン</div>
				</button>
			</>
		);
	}

	return (
		<button
			type="button"
			className={styles.megaphoneButtonContainer}
			onClick={toggleIsActive}
		>
			<div
				className={classNames(styles.megaphoneIconContainer, {
					[`${styles.isOff}`]: !isActiveMegaphone,
				})}
			>
				{isActiveMegaphone ? <MegaphoneIcon /> : <OffMegaphoneIcon />}
			</div>
			<div
				className={classNames(styles.megaphoneButtonLabel, {
					[`${styles.isOff}`]: !isActiveMegaphone,
				})}
			>
				メガホン
			</div>
		</button>
	);
};
