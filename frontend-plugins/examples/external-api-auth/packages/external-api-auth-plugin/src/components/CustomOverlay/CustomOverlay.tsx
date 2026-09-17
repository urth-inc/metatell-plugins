import React, { useCallback, useState } from "react";

import {
  describeAuthError,
  fetchMetatellCounter,
  type MetatellCounterResponse
} from "../../apiClient.js";
import styles from "./CustomOverlay.module.scss";

type RequestState = "idle" | "loading" | "success" | "error";

export function CustomOverlay(): JSX.Element {
  const [requestState, setRequestState] = useState<RequestState>("idle");
  const [counter, setCounter] = useState<MetatellCounterResponse | null>(null);
  const [message, setMessage] = useState("Ready");

  const callExternalApi = useCallback(async () => {
    setRequestState("loading");
    setMessage("Calling external API");

    try {
      const response = await fetchMetatellCounter();

      setCounter(response);
      setRequestState("success");
      setMessage("Authenticated");
    } catch (error) {
      setRequestState("error");
      setMessage(describeAuthError(error));
    }
  }, []);

  return (
    <aside className={styles.root} data-state={requestState}>
      <div className={styles.header}>
        <span className={styles.title}>External API Auth</span>
        <span className={styles.status}>{requestState}</span>
      </div>

      <div className={styles.metrics}>
        <div className={styles.metric}>
          <span className={styles.label}>Count</span>
          <strong className={styles.value}>{counter?.count ?? "-"}</strong>
        </div>
        <div className={styles.metric}>
          <span className={styles.label}>Subject</span>
          <strong className={styles.value}>
            {counter?.subject ?? "-"}
          </strong>
        </div>
      </div>

      <p className={styles.message}>{message}</p>

      <button
        className={styles.button}
        disabled={requestState === "loading"}
        onClick={callExternalApi}
        type="button"
      >
        {requestState === "loading" ? "Calling..." : "Call API"}
      </button>
    </aside>
  );
}
