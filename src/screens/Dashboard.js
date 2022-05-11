import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Meeting from "../components/Meeting";
import MessagePanel from "../components/MessagePanel";
import WaitingList from "../components/WaitingList";
import {
  deleteChannelMessage,
  pushNewChannelMessage,
  updateChannelMessage,
} from "../features/channel";
import { chimeAxios } from "../helpers/axios.helper";

export default function Dashboard() {
  const userSelector = useSelector((state) => state.user);
  const channelSelector = useSelector((state) => state.channel);
  const dispatch = useDispatch();

  const [meetingStarted, setMeetingStarted] = useState(false);

  useEffect(() => {
    getSocketUrl(userSelector.userId).then((response) => {
      initSocketConnection(response.ConnectLink);
    });
  }, []);

  const meetingStarts = (flag) => {
    setMeetingStarted(flag);
  };

  const initSocketConnection = (socketUrl) => {
    let socket = new WebSocket(socketUrl);

    socket.onmessage = (e) => {
      let message = JSON.parse(e.data).Headers["x-amz-chime-event-type"];

      if (message === "CREATE_CHANNEL_MESSAGE") {
        let data = JSON.parse(e.data);
        let payload = JSON.parse(data.Payload);

        console.log(payload);
        let incoming =
          payload.Sender.Arn.split("/user/")[1] === userSelector.userId;
        dispatch(pushNewChannelMessage({ incoming, ...payload }));
      }

      if (message === "DELETE_CHANNEL_MESSAGE") {
        let data = JSON.parse(e.data);
        let payload = JSON.parse(data.Payload);

        dispatch(deleteChannelMessage(payload));
      }

      if (message === "UPDATE_CHANNEL_MESSAGE") {
        let data = JSON.parse(e.data);
        let payload = JSON.parse(data.Payload);

        dispatch(updateChannelMessage(payload));
      }
    };

    socket.onclose = function (event) {
      if (event.wasClean) {
        console.log(
          `[close] Соединение закрыто чисто, код=${event.code} причина=${event.reason}`
        );
      } else {
        // например, сервер убил процесс или сеть недоступна
        // обычно в этом случае event.code 1006
        console.log("[close] Соединение прервано");
      }
    };

    socket.onerror = function (error) {
      alert(`[error] ${error.message}`);
    };
  };

  return (
    <>
      <WaitingList />

      {meetingStarted ? (
        <Meeting meetingStarted={meetingStarts} />
      ) : (
        <MessagePanel
          meetingStarted={meetingStarts}
          channelArn={channelSelector.channelArn || ""}
        />
      )}
    </>
  );
}

async function getSocketUrl(userId) {
  try {
    const resp = await chimeAxios.get("messaging/connectionLink", {
      params: {
        userId: userId,
      },
    });

    return resp.data;
  } catch (error) {
    throw error;
  }
}
