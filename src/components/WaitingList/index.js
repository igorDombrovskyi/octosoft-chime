import React, { useEffect, useState } from "react";
import { faker } from "@faker-js/faker";
import * as uuid from "uuid";
import moment from "moment";
import "./index.css";
import { chimeAxios } from "../../helpers/axios.helper";
import { useDispatch, useSelector } from "react-redux";
import { setChannels, setChannelArn } from "../../features/channel";
import { setCompanion, setCompanionList } from "../../features/user";

export default function WaitingList() {
  const userSelector = useSelector((state) => state.user);
  const [userList, setUserList] = useState([]);

  const dispatch = useDispatch();
  const channelSelector = useSelector((state) => state.channel);

  const listChannels = channelSelector.channels;

  useEffect(() => {
    setUserList(initUsers());
    if (userSelector.userId) {
      initChannels(userSelector.userId).then((response) => {
        dispatch(setChannels(response.ChannelMemberships));
        dispatch(setCompanionList(response.ChannelMemberships));
      });
    }
  }, []);

  const isLastMessageExists = (userId) => {
    const channel = channelSelector.channelList.find(
      (c) => JSON.parse(c.ChannelSummary.Metadata).patientId === userId
    );

    return channel.lastMessage || "";
  };

  const navToChat = async (patientId, patientAvatar, patientName) => {
    console.log("patientId", patientId);
    const resp = await chimeAxios.post("messaging/createChannel", {
      doctorId: userSelector.userId,
      patientId: patientId,
    });

    if (resp.data.ChannelArn) {
      dispatch(setChannelArn(resp.data.ChannelArn));
      dispatch(
        setCompanion({
          companionId: patientId,
          companionAvatar: patientAvatar,
          companionName: patientName,
        })
      );
    }
  };

  useEffect(() => {
    chimeAxios
      .get("messaging/listChannels", {
        params: {
          userId: userSelector.userId,
        },
      })
      .then((response) => {
        dispatch(setChannels(response.data.ChannelMemberships));
      });
  }, []);

  return (
    <div className="waiting-list-container">
      <div className="waiting-list-wrapper">
        <div className="waiting-list-tab-buttons">
          <button className="waiting-list-tab-buttons-active">
            Waiting List <span>{userList.length}</span>
          </button>
          <button>completed</button>
        </div>
      </div>
      <div
        className="waiting-list-item-container"
        onClick={(e) => {
          e.preventDefault();
          navToChat(userSelector.userId, faker.image.avatar(), faker.name.findName());
        }}
      >
        <div className="waiting-list-item-avatar-container">
          <img className="avatar" src={faker.image.avatar()} alt="avatar" />
        </div>
        <div>
          <div className="waiting-list-item-desc">
            <p>{faker.name.findName()}</p>
            <span>{moment(new Date()).format("HH:MM")}</span>
          </div>
          <div className="waiting-list-last-message">
            {/* {<span>{isLastMessageExists(userSelector.userId)}</span>} */}
          </div>
        </div>
      </div>
      {userSelector.companionList.length ? (
        userSelector.companionList.map((user, i) => {
          return (
            <div
              key={i}
              className="waiting-list-item-container"
              onClick={(e) => {
                e.preventDefault();
                navToChat(user.userId, user.avatarUrl, user.name);
              }}
            >
              <div className="waiting-list-item-avatar-container">
                <img className="avatar" src={user.avatarUrl} alt="avatar" />
              </div>
              <div>
                <div className="waiting-list-item-desc">
                  <p>{user.name}</p>
                  <span>{moment(new Date()).format("HH:MM")}</span>
                </div>
                <div className="waiting-list-last-message">
                  {<span>{isLastMessageExists(user.userId)}</span>}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div>Users dont exists</div>
      )}
    </div>
  );
}

function initUsers() {
  let users = [];

  for (let i = 0; i < 10; i++) {
    users.push({
      userId: uuid.v4(),
      name: `${faker.name.findName()} ${faker.name.lastName()}`,
      avatarUrl: faker.image.avatar(),
    });
  }

  return users;
}

async function initChannels(userId) {
  try {
    const resp = await chimeAxios.get("messaging/listChannels", {
      params: {
        userId: userId,
      },
    });

    return resp.data;
  } catch (error) {
    throw error;
  }
}