import type React from "react";
import { toast } from "react-toastify";

import styles from "./MegaphoneRequestToast.module.scss";

type Props = {
	name: string;
	sessionId: string;
	approveMegaphoneRequest: (sessionId: string) => void;
};

const dismiss = (sessionId: string) => {
	return () => {
		toast.dismiss(`megaphone-${sessionId}`);
	};
};

export const MegaphoneRequestToast: React.FC<Props> = ({
	name,
	sessionId,
	approveMegaphoneRequest,
}) => {
	return (
		<div className={styles.megaphoneToastContainer}>
			<p>{name} さんがメガホン権限を申請しています。</p>
			<div className={styles.megaphoneToastButtonContainer}>
				<button
					type="button"
					onClick={dismiss(sessionId)}
					className={styles.megaphoneDeniedButton}
				>
					却下
				</button>
				<button
					type="button"
					onClick={() => {
						approveMegaphoneRequest(sessionId);
					}}
					className={styles.megaphoneApproveButton}
				>
					承認
				</button>
			</div>
		</div>
	);
};
