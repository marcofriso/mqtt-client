import React, { useEffect, useState } from "react";
import { Card, List, Row, Col } from "antd";

const Receiver = ({ payload }) => {
  const [messages, setMessages] = useState([]);
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
    payload.topic &&
    isJson(payload.message) &&
    JSON.parse(payload.message).username.length;

  useEffect(() => {
    if (isValidMessage) {
      const { messageText, username, datetime } = JSON.parse(payload.message);
      const dt = new Date(datetime);
      const displayedMessage = `${dt.getHours()}:${dt.getMinutes()} [${username}] : ${messageText}`;
      const updatedMessages = [...messages, displayedMessage];

      if (updatedMessages.length > maxMessagesListLength)
        updatedMessages.shift();

      setMessages(updatedMessages);
      // console.log(messages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload, isValidMessage]);

  const renderListItem = (item) => (
    <List.Item>
      <List.Item.Meta title={item} />
    </List.Item>
  );

  return (
    <Card title="Receiver" style={{ minHeight: "280px" }}>
      <Row gutter={20}>
        <Col span={18}>
          <p>Messages</p>
          <List
            size="small"
            bordered
            dataSource={messages}
            renderItem={renderListItem}
            style={{
              maxHeight: "2000px",
              overflow: "auto",
            }}
          />
        </Col>
        <Col span={6}>
          <p>Active Users</p>
          <List
            size="small"
            bordered
            dataSource={messages}
            renderItem={renderListItem}
            style={{
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
