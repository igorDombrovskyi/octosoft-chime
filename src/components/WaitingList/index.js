/* eslint-disable no-loop-func */
/* eslint-disable no-restricted-globals */
import React, { useCallback, useEffect, useState } from "react";
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
  // const channelSelector = useSelector((state) => state.channel);

  // const listChannels = channelSelector.channels;

  useEffect(() => {
    setUserList(initUsers());
    if (userSelector.userId) {
      let token;
      do {
        getChannels(userSelector.userId, token).then((data) => {
          if (data.NextToken) {
            token = data.NextToken;
            getChannels(userSelector.userId, token);
          }
          dispatch(setChannels(data.ChannelMemberships));
          dispatch(setCompanionList(data.ChannelMemberships));
        });
      } while (token);
    }
  }, []);

  const handlePressCompanion = useCallback(
    async (patientId, patientAvatar, patientName) => {
      const resp = await chimeAxios.post("messaging/createChannel", {
        doctorId: "d8de9353-6588-4b1e-925e-1fdf88efdf5b",
        patientId: "dfd529c7-0717-460d-8aee-e85242c41af1",
      });

      await chimeAxios.post("messaging/connectToChannel", {
        channelArn: resp.data.ChannelArn,
        userId: "d8de9353-6588-4b1e-925e-1fdf88efdf5b",
        remainingTime: 15,
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
    },
    []
  );

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
          handlePressCompanion(
            userSelector.userId,
            faker.image.avatar(),
            faker.name.findName()
          );
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
                handlePressCompanion(user.userId, user.avatarUrl, user.name);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                if (
                  confirm(
                    `Do you want delete chat with these user: ${user.name}`
                  )
                ) {
                  deleteChannel(userSelector.userId, user.userId).then(
                    (response) => {
                      alert(response.Message);
                      let token;
                      do {
                        getChannels(userSelector.userId, token).then((data) => {
                          if (data.NextToken) {
                            token = data.NextToken;
                            getChannels(userSelector.userId, token);
                          }
                          dispatch(setChannels(data.ChannelMemberships));
                          dispatch(setCompanionList(data.ChannelMemberships));
                        });
                      } while (token);
                    }
                  );
                }
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
                  <span>{"some time"}</span>
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

async function getChannels(userId, token) {
  try {
    const resp = await chimeAxios.get("messaging/listChannels", {
      params: {
        userId: userId,
        nextToken: token || null,
      },
    });

    return resp.data;
  } catch (error) {
    console.log(error)
  }
}

async function deleteChannel(userId, companionId) {
  try {
    const resp = await chimeAxios.delete("messaging/deleteChannel", {
      params: {
        userId: userId,
        companionId: companionId,
      },
    });

    return resp.data;
  } catch (error) {
    console.log(error)
  }
}
