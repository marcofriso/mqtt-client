import React, { useEffect, useRef, useCallback } from "react";
import { Card, List, Row, Col, Button } from "antd";
import { presenceTopic, privateTopic, publicTopic } from "../utils";

const Receiver = ({
  payload,
  availabilityCheckInterval,
  isPresenceSubed,
  connected,
  username,
  setTopic,
  topic,
}) => {
  let messages = useRef([]);
  let connectedUserList = useRef(new Set([]));
  let userList = useRef(new Set(["--all--"]));
  let presenceMessages = useRef([]);

  const maxMessagesListLength = 1000;

  const isJson = (str) => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  };

  const isValidMessage =
    payload?.topic !== presenceTopic &&
    isJson(payload.message) &&
    JSON.parse(payload.message).username?.length;

  const isValidPresenceMessage =
    payload?.topic === presenceTopic &&
    isJson(payload.message) &&
    JSON.parse(payload.message).username?.length;

  useEffect(() => {
    if (isValidMessage) {
      const updatedMessages = [...messages.current, payload];

      if (updatedMessages.length > maxMessagesListLength)
        updatedMessages.shift();

      messages.current = updatedMessages;
    }
  }, [payload, isValidMessage]);

  const setUsers = useCallback(() => {
    if (presenceMessages.current.length) {
      const time = new Date().getTime();

      const filterRecentMessages = presenceMessages.current.filter(
        (message) => {
          const messageTime = new Date(message.datetime).getTime();

          return time - messageTime < availabilityCheckInterval * 1.5;
        }
      );

      const connectedUsers = filterRecentMessages
        .filter((message) => message.username !== username)
        .map((message) => message.username);

      connectedUserList.current = new Set(
        [...connectedUsers, "--all--"].sort()
      );

      userList.current = new Set(
        [...[...userList.current, ...connectedUsers]].sort()
      );

      presenceMessages.current = filterRecentMessages;
    }
  }, [availabilityCheckInterval, username]);

  useEffect(() => {
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
    isValidPresenceMessage,
    presenceMessages,
    setUsers,
    isPresenceSubed,
    topic,
    setTopic,
  ]);

  const renderListItem = (item) => {
    const { messageText, username, datetime } = JSON.parse(item.message);

    const isPrivate = item.topic !== publicTopic;
    const dt = new Date(datetime);
    const messageIntro = `${dt.getHours()}:${dt.getMinutes()} [${username}]`;

    return (
      <List.Item>
        {messageIntro}:{" "}
        <i
          style={{ display: isPrivate ? "inline-block" : "none" }}
          className={"fa fa-lock"}
        />{" "}
        {messageText}
      </List.Item>
    );
  };

  const renderUserListItem = (item) => {
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
          )}
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
            dataSource={messages.current}
            renderItem={renderListItem}
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
            dataSource={userList.current}
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
