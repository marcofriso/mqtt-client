import React, { useEffect, useRef, useCallback, useState } from "react";
import { Card, List, Row, Col, Button } from "antd";
import {
  Payload,
  PresencePayloadMessage,
  ReceiverProps,
} from "../models/receiver";
import {
  availabilityCheckInterval,
  isJson,
  maxMessageListLength,
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
  let presenceMessages = useRef<PresencePayloadMessage[]>([]);
  let userList = useRef<Set<string>>(new Set(["--all--"]));
  const [userMessages, setUserMessages] = useState([]);
  const [connectedUserList, setConnectedUserList] = useState<Set<string>>(
    new Set([])
  );

  const isValidUserMessage =
    payload?.topic !== presenceTopic &&
    isJson(payload.message) &&
    JSON.parse(payload.message).username?.length;

  const isValidPresenceMessage =
    payload?.topic === presenceTopic &&
    isJson(payload.message) &&
    JSON.parse(payload.message).username?.length;

  const updateUsers = useCallback(() => {
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

      setConnectedUserList(new Set([...connectedUsers, "--all--"].sort()));

      userList.current = new Set(
        [...[...userList.current, ...connectedUsers]].sort()
      );
    }
  }, [username]);

  useEffect(() => {
    if (isValidPresenceMessage) {
      console.log("MESSAGES PRESENCE", payload.message);
      const { username, datetime } = JSON.parse(payload.message);

      const updatedMessages = [
        ...presenceMessages.current,
        { username, datetime },
      ];
      presenceMessages.current = updatedMessages;

      if (isPresenceSubed) updateUsers();
    }
  }, [isPresenceSubed, isValidPresenceMessage, payload.message, updateUsers]);

  useEffect(() => {
    if (isValidUserMessage) {
      const updatedMessages = [...userMessages, payload];
      if (updatedMessages.length > maxMessageListLength)
        updatedMessages.shift();

      setUserMessages(updatedMessages as never);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValidUserMessage, payload]);

  useEffect(() => {
    if (![...connectedUserList].includes(topic.replace(privateTopic, ""))) {
      setTopic(publicTopic);
    }
  }, [connectedUserList, setTopic, topic]);

  useEffect(() => {
    if (connected !== "Connected") {
      setConnectedUserList(new Set([]));
    }
  }, [connected]);

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
      ![...connectedUserList].includes(item) || connected !== "Connected";
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

  console.log("CONNECTED", connectedUserList);
  return (
    <Card title="Receiver">
      <Row gutter={20}>
        <Col span={18}>
          <p>Messages</p>
          <List
            size="small"
            bordered
            dataSource={userMessages}
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
