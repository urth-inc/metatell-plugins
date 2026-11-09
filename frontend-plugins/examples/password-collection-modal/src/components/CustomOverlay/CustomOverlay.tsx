import type React from "react";
import { PasswordCollectionModal } from "../PasswordCollectionModal";
import styles from "./CustomOverlay.module.scss";

type CustomOverlayProps = {};

export const CustomOverlay: React.FC<CustomOverlayProps> = () => {
  return (
    <div className={styles.customOverlayContainer}>
      <PasswordCollectionModal />
    </div>
  );
};
