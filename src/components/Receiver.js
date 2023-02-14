import React, { useEffect, useState, useRef, useCallback } from "react";
import { Card, List, Row, Col, Button } from "antd";

const Receiver = ({
  payload,
  availabilityCheckInterval,
  isPresenceSubed,
  connected,
  username,
}) => {
  const [messages, setMessages] = useState([]);
  //const [userList, setUserList] = useState(() => new Set(["--all--"]));
  const [connectedUserList, setConnectedUserList] = useState(() => new Set([]));

  useEffect(() => console.log("RELOAD"), []);

  let userList = useRef(["--all--"]);

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
    payload?.topic !== "presence" &&
    isJson(payload.message) &&
    JSON.parse(payload.message).username?.length;

  const isValidPresenceMessage =
    payload?.topic === "presence" &&
    isJson(payload.message) &&
    JSON.parse(payload.message).username?.length;

  useEffect(() => {
    if (isValidMessage) {
      const { messageText, username, datetime } = JSON.parse(payload.message);

      const dt = new Date(datetime);
      const displayedMessage = `${dt.getHours()}:${dt.getMinutes()} [${username}] : ${messageText}`;

      const updatedMessages = [...messages, displayedMessage];

      if (updatedMessages.length > maxMessagesListLength)
        updatedMessages.shift();

      setMessages(updatedMessages);
      console.log("MESSAGES ", messages);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      console.log("USERNAME", username);

      setConnectedUserList(new Set([...connectedUsers, "--all--"].sort()));

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
    }
  }, [
    payload,
    isValidPresenceMessage,
    presenceMessages,
    setUsers,
    isPresenceSubed,
  ]);

  const renderListItem = (item) => (
    <List.Item>
      <List.Item.Meta title={item} />
    </List.Item>
  );

  const renderUserListItem = (item) => {
    console.log("CONN-LIST", connectedUserList);
    let isDisabled =
      ![...connectedUserList].includes(item) || connected !== "Connected";

    return (
      <List.Item>
        <i
          style={{ visibility: isDisabled ? "visible" : "hidden" }}
          className={"fa fa-ban"}
        />
        <Button disabled={isDisabled}>{item}</Button>
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
            dataSource={messages}
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
