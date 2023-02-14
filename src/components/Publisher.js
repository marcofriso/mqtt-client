import React from "react";
import { Card, Form, Input, Row, Col, Button } from "antd";

const Publisher = ({ publish, topic, username }) => {
  const [form] = Form.useForm();

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

    // console.log("PUB-VALS ", publishedValues);

    publish(publishedValues);
    form.resetFields();
  };

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
            <Input.TextArea />
          </Form.Item>
        </Col>
        <Col span={24} style={{ textAlign: "center" }}>
          <Form.Item>
            <Button type="primary" htmlType="submit">
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
