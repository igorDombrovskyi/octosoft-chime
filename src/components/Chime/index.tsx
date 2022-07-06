import React, { FC, useState } from "react";
import { useCallback } from "react";
import { MessagePanel } from "../MessagePanel";
import { ChimeMeeting } from "./meeting";
import styles from "./styles.module.scss";

type ChimeView = {
  containerStyles?: string;
};

export const ChimeView: FC<ChimeView> = ({ containerStyles }) => {
  const [isInMeetingMode, setIsInMeetingMode] = useState(false);

  const handlePhoneCallPress = useCallback(() => {
    setIsInMeetingMode(true);
  }, []);

  console.log(ChimeMeeting, "olololololo");

  return (
    <div className={`${styles.container} ${containerStyles || ""}`}>
      <ChimeMeeting />
      {/* {isInMeetingMode ? (
        <Meeting />
      ) : ( */}
      {/* <MessagePanel onPressCall={handlePhoneCallPress} /> */}
      {/* )} */}
    </div>
  );
};
