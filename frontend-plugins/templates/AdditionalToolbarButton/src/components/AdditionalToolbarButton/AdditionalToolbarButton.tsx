import styles from "./AdditionalToolbarButton.module.scss";

type AdditionalToolbarButtonProps = {
	label?: string;
	onClick?: () => void;
};

/** A minimal button intended to be placed in the metatell toolbar. */
export const AdditionalToolbarButton = ({
	label = "追加",
	onClick = () => window.alert("追加ボタンがクリックされました"),
}: AdditionalToolbarButtonProps) => {
	return (
		<button className={styles.button} onClick={onClick} type="button">
			<span aria-hidden="true" className={styles.icon}>
				<span className={styles.iconMark}>+</span>
			</span>
			<span className={styles.label}>{label}</span>
		</button>
	);
};
