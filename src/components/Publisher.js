import React, { useState, useEffect } from "react";
import { Card, Form, Input, Row, Col, Button } from "antd";

const Publisher = ({ publish, topic, username, connectStatus }) => {
  const [form] = Form.useForm();
  const [isDisabled, setIsDisabled] = useState(true);

  const record = {
    messageText: "",
  };

  const onFinish = ({ messageText }) => {
    const publishedValues = {
      topic,
      payload: JSON.stringify({
        datetime: new Date(),
        messageText,
        username,
      }),
    };

    publish(publishedValues);
    form.resetFields();
  };

  const onValueChange = (e) => {
    e.target.value.length && connectStatus === "Connected"
      ? setIsDisabled(false)
      : setIsDisabled(true);

    e.preventDefault();
  };

  useEffect(() => {
    const formMessage = form.getFieldValue("messageText");

    formMessage.length && connectStatus === "Connected"
      ? setIsDisabled(false)
      : setIsDisabled(true);
  }, [connectStatus, form]);

  const displayedTopic = topic === "public" ? "All" : topic;

  const PublishForm = (
    <Form
      layout="vertical"
      name="basic"
      form={form}
      initialValues={record}
      onFinish={onFinish}
    >
      <Row gutter={20}>
        <Col span={24}>
          <Form.Item label="Message" name="messageText">
            <Input.TextArea onChange={onValueChange} />
          </Form.Item>
        </Col>
        <Col span={24} style={{ textAlign: "center" }}>
          <Form.Item>
            <Button
              disabled={isDisabled || connectStatus !== "Connected"}
              type="primary"
              htmlType="submit"
            >
              Send to {displayedTopic}
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  return <Card title="Publisher">{PublishForm}</Card>;
};

export default Publisher;
