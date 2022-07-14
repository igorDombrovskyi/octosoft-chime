import axios from "axios";

const BASE_URL = "https://octodoc-chime.herokuapp.com/api";

interface IFileObject {
  uri?: string;
  type?: string;
  name?: string;
  size?: number | null;
}

type CreateMeetingDto = {
  userId: string;
  companionId: string;
  remainingTime: number | string;
};

export const createMeetingApi = async ({
  userId,
  companionId,
  remainingTime,
}: CreateMeetingDto) => {
  const resp = await axios.post(`${BASE_URL}/meeting/createMeeting`, {
    userId,
    companionId,
    remainingTime,
  });
  return resp.data;
};

type DeleteMeetingDto = {
  meetingId: string;
};

export const getRemainingTime = async (meetingId: string) => {
  const resp = await axios.get(`${BASE_URL}/meeting/timer`, {
    params: {
      meetingId,
    },
  });
  return resp;
};

export const deleteMeeting = async ({ meetingId }: DeleteMeetingDto) => {
  return await axios.delete(`${BASE_URL}/meeting/deleteMeeting`, {
    data: {
      meetingId,
    },
  });
};

export const connectToMeetingApi = async (
  meetingId: string,
  userId: string,
) => {
  const resp = await axios.post(`${BASE_URL}/meeting/connectToMeeting`, {
    meetingId,
    userId,
  });
  return resp.data;
};

export const disconnectFromMeetingApi = async (
  meetingId: string,
  userId: string,
) => {
  const resp = await axios.post(`${BASE_URL}/meeting/disconnectFromMeeting`, {
    meetingId,
    userId,
  });
  return resp.data;
};

export const getMeetingTimersData = async ({ meetingId }: DeleteMeetingDto) => {
  return await axios.get(`${BASE_URL}/meeting/consultTime`, {
    params: {
      meetingId,
    },
  });
};

export const createChatChanelAPI = async ({
  userId,
  companionId,
  remainingTime,
}: CreateMeetingDto) => {
  const resp = await axios.post(`${BASE_URL}/messaging/createChannel`, {
    doctorId: companionId,
    patientId: userId,
    remainingTime,
  });
  return resp.data;
};

export const connectToChatApi = async ({
  channelArn,
  userId,
  remainingTime,
}: {
  channelArn: string;
  userId: string;
  remainingTime: string | number;
}) => {
  const resp = await axios.post(`${BASE_URL}/messaging/connectToChannel`, {
    channelArn,
    userId,
    remainingTime,
  });
  return resp.data;
};

export const disconnectFromChatApi = async ({
  channelArn,
  userId,
}: {
  channelArn: string;
  userId: string;
}) => {
  const resp = await axios.post(`${BASE_URL}/messaging/leaveFromChannel`, {
    channelArn,
    userId,
  });
  return resp.data;
};

export const getChatConsultTimeApi = async ({ channelArn = "" }) => {
  const resp = await axios.get(`${BASE_URL}/messaging/consultTime`, {
    params: {
      channelArn,
    },
  });
  return resp.data;
};

export const getConnectionLinkAPI = async ({ userId = "" }) => {
  const resp = await axios.get(`${BASE_URL}/messaging/connectionLink`, {
    params: {
      userId: userId,
    },
  });
  return resp.data;
};

export const getChatMessagesAPI = async ({
  userId = "",
  channelId = "",
  nextToken = "",
}) => {
  const resp = await axios.get(`${BASE_URL}/messaging/listChannelMessages`, {
    params: {
      userId: userId,
      channelArn: channelId,
      nextToken,
    },
  });
  resp.data.ChannelMessages.forEach((item) => {
    try {
      const parsedContent = JSON?.parse(item.Content);
      item.Content = parsedContent?.message;
    } catch (e) {}
  });
  return resp.data;
};

export const sendMessageAPI = async ({
  userId = "",
  message = "",
  chanelId = "",
}) => {
  const resp = await axios.post(`${BASE_URL}/messaging/sendChannelMessage`, {
    channelArn: chanelId,
    userId: userId,
    content: message,
  });
  return resp.data;
};

export const editMessageAPI = async ({
  userId = "",
  chanelId = "",
  message = "",
  messageId = "",
}) => {
  const resp = await axios.put(`${BASE_URL}/messaging/updateChannelMessage`, {
    channelArn: chanelId,
    userId: userId,
    messageId: messageId,
    content: message,
  });
  return resp.data;
};

export const attachFileMessageAPI = async ({
  userId,
  channelArn,
  file,
  pendingId,
}: {
  userId: string;
  channelArn: string;
  pendingId: string;
  file: IFileObject | null;
}) => {
  const fd = new FormData();
  fd.append("userId", userId);
  fd.append("channelArn", channelArn);
  fd.append("file", file);
  fd.append("pendingId", pendingId);
  const resp = await axios.post(
    `${BASE_URL}/messaging/sendChannelAttachment`,
    fd,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return resp.data;
};

export const deleteMessageAPI = async ({
  userId = "",
  chanelId = "",
  messageId = "",
}) => {
  const resp = await axios.delete(
    `${BASE_URL}/messaging/deleteChannelMessage`,
    {
      params: {
        channelArn: chanelId,
        userId: userId,
        messageId: messageId,
      },
    }
  );
  return resp.data;
};
