import React, { FC, useState } from "react";
import { useCallback } from "react";
import { useMeeting } from "../../context/chime/hooks/useMeeting";
import { MessagePanel } from "../MessagePanel";
import { ChimeMeeting } from "./meeting";
import styles from "./styles.module.scss";

type ChimeView = {
  containerStyles?: string;
};

export const ChimeView: FC<ChimeView> = ({ containerStyles }) => {
  const [isInMeetingMode, setIsInMeetingMode] = useState(false);
  const { joinVideoCall } = useMeeting(
    "d8de9353-6588-4b1e-925e-1fdf88efdf5b",
    "dfd529c7-0717-460d-8aee-e85242c41af1"
  );

  const handlePhoneCallPress = useCallback(() => {
    setIsInMeetingMode(true);
  }, []);

  return (
    <div className={`${styles.container} ${containerStyles || ""}`}>
      <button onClick={joinVideoCall}>Join Meeting</button>
      <ChimeMeeting />
      <MessagePanel
        user={{
          id: "dfd529c7-0717-460d-8aee-e85242c41af1",
          name: "Maximov",
          surname: "Kirill",
          avatarUrl:
            "https://gravatar.com/avatar/b59e9d2e83e5a2ca278f24d3a91885c7?s=400&d=robohash&r=x",
          online: true,
        }}
        companion={{
          id: "d8de9353-6588-4b1e-925e-1fdf88efdf5b",
          name: "Igor",
          surname: "Dombrovskyu",
          avatarUrl:
            "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50",
          online: true,
        }}
      />
      {/* {isInMeetingMode ? (
        <Meeting />
      ) : ( */}
      {/* <MessagePanel onPressCall={handlePhoneCallPress} /> */}
      {/* )} */}
    </div>
  );
};
