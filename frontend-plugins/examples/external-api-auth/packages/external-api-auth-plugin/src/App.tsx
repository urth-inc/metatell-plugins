import React from "react";

import { CustomOverlay } from "./components/CustomOverlay/index.js";
import styles from "./App.module.scss";

export default function App(): JSX.Element {
  return (
    <main className={styles.root}>
      <CustomOverlay />
    </main>
  );
}
