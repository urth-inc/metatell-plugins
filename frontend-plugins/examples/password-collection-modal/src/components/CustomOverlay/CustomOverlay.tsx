import React from "react";

import * as styles from "./CustomOverlay.module.scss";
import { PasswordCollectionModal } from "../PasswordCollectionModal";
interface CustomOverlayProps {}

export const CustomOverlay: React.FC<CustomOverlayProps> = () => {
  return (
    <div className={styles.customOverlayContainer}>
      <PasswordCollectionModal />
    </div>
  );
};
