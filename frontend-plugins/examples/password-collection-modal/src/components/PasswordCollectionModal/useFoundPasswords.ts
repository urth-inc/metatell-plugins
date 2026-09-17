import { useState, useEffect } from "react";

const getCurrentHubId = () => {
  const qs = new URLSearchParams(location.search);

  return (
    qs.get("hub_id") || document.location.pathname.substring(1).split("/")[0]
  );
};

export const useFoundPasswords = () => {
  const [foundPasswords, setFoundPasswords] = useState([]);

  const handleChangeStorage = () => {
    const roomId = getCurrentHubId();
    if (!roomId) {
      console.error("Room ID is not found");
      return;
    }

    const storedData = JSON.parse(
      localStorage.getItem("foundPasswordObjectNames") || "{}",
    );

    const foundPasswordObjectNames = storedData[roomId] ?? [];

    // @ts-expect-error - type definition is incomplete
    setFoundPasswords([...foundPasswordObjectNames]);
  };

  // @ts-expect-error - type definition is missing
  const handleFindPassword = (detail) => {
    const index = detail.index;
    const imgSrc = detail.image_url;
    const roomId = getCurrentHubId();

    if (!roomId) {
      console.error("Room ID is not found");
      return;
    }

    const storedData = JSON.parse(
      localStorage.getItem("foundPasswordObjectNames") || "{}",
    );

    const prevFoundPasswordObjectNames = storedData[roomId] ?? [];

    const prevIndex = prevFoundPasswordObjectNames.findIndex(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (v: any) => v.index === index,
    );

    const newFoundPasswordObjectNames = [...prevFoundPasswordObjectNames];
    if (prevIndex !== -1) {
      newFoundPasswordObjectNames[prevIndex] = {
        index,
        imgSrc,
      };
    } else {
      newFoundPasswordObjectNames.push({
        index,
        imgSrc,
      });
    }

    storedData[roomId] = newFoundPasswordObjectNames;

    localStorage.setItem(
      "foundPasswordObjectNames",
      JSON.stringify(storedData),
    );

    // @ts-expect-error - type definition is incomplete
    setFoundPasswords([...newFoundPasswordObjectNames]);
  };

  useEffect(() => {
    handleChangeStorage();

    const handleEvent = (event: CustomEvent) => {
      handleFindPassword(event.detail);
    };

    // @ts-expect-error - type definition is incomplete
    window.addEventListener("find-password", handleEvent);

    return () => {
      // @ts-expect-error - type definition is incomplete
      window.removeEventListener("find-password", handleEvent);
    };
  }, []);

  return { foundPasswords };
};
