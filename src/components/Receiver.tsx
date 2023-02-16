import React, { useEffect, useRef, useCallback } from "react";
import { Card, List, Row, Col, Button } from "antd";
import {
  Payload,
  PresencePayloadMessage,
  ReceiverProps,
} from "../models/receiver";
import {
  availabilityCheckInterval,
  isJson,
  maxMessagesListLength,
  presenceTopic,
  privateTopic,
  publicTopic,
} from "../utils";

const Receiver = ({
  payload,
  isPresenceSubed,
  connected,
  username,
  setTopic,
  topic,
}: ReceiverProps) => {
  let userMessages = useRef<Payload[]>([]);
  let presenceMessages = useRef<PresencePayloadMessage[]>([]);
  let connectedUserList = useRef<Set<string>>(new Set([]));
  let userList = useRef<Set<string>>(new Set(["--all--"]));

  const isValidUserMessage =
    payload?.topic !== presenceTopic &&
    isJson(payload.message) &&
    JSON.parse(payload.message).username?.length;

  const isValidPresenceMessage =
    payload?.topic === presenceTopic &&
    isJson(payload.message) &&
    JSON.parse(payload.message).username?.length;

  const setUsers = useCallback(() => {
    if (presenceMessages.current.length) {
      const time = new Date().getTime();

      const filterRecentMessages = presenceMessages.current.filter(
        (message) => {
          const messageTime = new Date(message.datetime).getTime();

          return time - messageTime < availabilityCheckInterval * 1.5;
        }
      );

      presenceMessages.current = filterRecentMessages;

      const connectedUsers = filterRecentMessages
        .filter((message) => message.username !== username)
        .map((message) => message.username);

      connectedUserList.current = new Set(
        [...connectedUsers, "--all--"].sort()
      );

      userList.current = new Set(
        [...[...userList.current, ...connectedUsers]].sort()
      );
    }
  }, [username]);

  useEffect(() => {
    if (isValidUserMessage) {
      const updatedMessages = [...userMessages.current, payload];

      if (updatedMessages.length > maxMessagesListLength)
        updatedMessages.shift();

      userMessages.current = updatedMessages;
      console.log("MESSAGES PRES", payload);
    }

    if (isValidPresenceMessage) {
      const { username, datetime } = JSON.parse(payload.message);

      const updatedMessages = [
        ...presenceMessages.current,
        { username, datetime },
      ];

      presenceMessages.current = updatedMessages;

      if (isPresenceSubed) setUsers();

      if (
        ![...connectedUserList.current].includes(
          topic.replace(privateTopic, "")
        )
      )
        setTopic(publicTopic);
    }
  }, [
    payload,
    isValidUserMessage,
    isValidPresenceMessage,
    isPresenceSubed,
    presenceMessages,
    setUsers,
    setTopic,
    topic,
  ]);

  const renderMessageListItem = (item: Payload) => {
    const { messageText, username, datetime } = JSON.parse(item.message);

    const isPrivate = item.topic !== publicTopic;
    const dt = new Date(datetime);
    const messageIntro = `${dt.getHours()}:${dt.getMinutes()} [${username}]`;

    return (
      <List.Item>
        {messageIntro}:{" "}
        {isPrivate && (
          <span>
            <i className={"fa fa-lock"} />
          </span>
        )}{" "}
        {messageText}
      </List.Item>
    );
  };

  const renderUserListItem = (item: string) => {
    const isDisabled =
      ![...connectedUserList.current].includes(item) ||
      connected !== "Connected";
    const selectTopic =
      item === "--all--" ? publicTopic : `${privateTopic}${item}`;

    return (
      <List.Item>
        <Button disabled={isDisabled} onClick={() => setTopic(selectTopic)}>
          {isDisabled && (
            <span style={{ marginRight: "5px" }}>
              <i className={"fa fa-ban"} />
            </span>
          )}{" "}
          {item}
        </Button>
      </List.Item>
    );
  };

  return (
    <Card title="Receiver">
      <Row gutter={20}>
        <Col span={18}>
          <p>Messages</p>
          <List
            size="small"
            bordered
            dataSource={userMessages.current}
            renderItem={renderMessageListItem}
            style={{
              minHeight: "170px",
              maxHeight: "2000px",
              overflow: "auto",
            }}
          />
        </Col>
        <Col span={6}>
          <p>Users</p>
          <List
            size="small"
            bordered
            dataSource={[...userList.current]}
            renderItem={renderUserListItem}
            style={{
              minHeight: "170px",
              maxHeight: "2000px",
              overflow: "auto",
            }}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default Receiver;
