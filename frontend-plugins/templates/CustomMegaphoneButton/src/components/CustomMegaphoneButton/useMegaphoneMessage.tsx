import React, { useEffect } from "react";
import { toast } from "react-toastify";

import { MegaphoneRequestToast } from "../MegaphoneRequestToast";

const showMegaphoneToast = ({
  sessionId,
  name,
  approveMegaphoneRequest,
}: {
  sessionId: string;
  name: string;
  approveMegaphoneRequest: (sessionId: string) => void;
}) => {
  const toastId = `megaphone-${sessionId}`;

  toast(
    <MegaphoneRequestToast
      name={name}
      sessionId={sessionId}
      approveMegaphoneRequest={approveMegaphoneRequest}
    />,
    {
      toastId,
      autoClose: false,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: false,
      position: "bottom-right",
      theme: "dark",
    },
  );
};

type Props = {
  mySessionId: string | undefined;
  messageDispatch: EventTarget;
  canMegaphone: boolean;
  temporalMegaphone: boolean;
  grantMegaphone: () => Promise<void>;
  revokeMegaphone: () => Promise<void>;
  approveMegaphoneRequest: (sessionId: string) => void;
};

export const useMegaphoneMessage = ({
  mySessionId,
  messageDispatch,
  canMegaphone,
  temporalMegaphone,
  grantMegaphone,
  revokeMegaphone,
  approveMegaphoneRequest,
}: Props) => {
  useEffect(() => {
    const onReceiveMegaphoneMessage = (event: CustomEvent) => {
      const newMessage = event.detail;
      const sessionId = newMessage.sessionId;

      if (newMessage.type === "request_megaphone") {
        if (!canMegaphone || newMessage.sent) {
          return;
        }

        showMegaphoneToast({
          sessionId,
          name: newMessage.name,
          approveMegaphoneRequest,
        });
      }

      if (newMessage.type === "approve_megaphone") {
        const targetSessionId = newMessage.body.targetId;
        toast.dismiss(`megaphone-${targetSessionId}`);

        if (temporalMegaphone) {
          return;
        }

        if (targetSessionId === mySessionId) {
          grantMegaphone().catch((error) => {
            console.error(error);
          });
        }
      }

      if (newMessage.type === "revoke_megaphone") {
        if (!temporalMegaphone) {
          return;
        }

        const targetSessionId = newMessage.body.targetId;

        if (targetSessionId === mySessionId) {
          revokeMegaphone().catch((error) => {
            console.error(error);
          });
        }
      }
    };

    if (messageDispatch) {
      // @ts-expect-error - type definition is incomplete
      messageDispatch.addEventListener("message", onReceiveMegaphoneMessage);
    }

    return () => {
      if (messageDispatch) {
        messageDispatch.removeEventListener(
          "message",
          // @ts-expect-error - type definition is incomplete
          onReceiveMegaphoneMessage,
        );
      }
    };
  }, [
    messageDispatch,
    canMegaphone,
    mySessionId,
    temporalMegaphone,
    grantMegaphone,
    revokeMegaphone,
    approveMegaphoneRequest,
  ]);
};
