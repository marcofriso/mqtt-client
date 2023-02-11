import React, { useState, useEffect } from "react";
import { Card, Button, Form, Input, Row, Col } from "antd";

const Connection = ({ connect, disconnect, connectBtn }) => {
  const [form] = Form.useForm();
  const [detailsDisplayProperty, setDetailsDisplayProperty] = useState("none");
  const [formFieldsDisabled, setFormFieldsDisabled] = useState("");

  const record = {
    host: "broker.emqx.io",
    clientId: `mqttjs_ + ${Math.random().toString(16).substr(2, 8)}`,
    port: 8083,
  };

  const options = {
    keepalive: 30,
    protocolId: "MQTT",
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
    will: {
      topic: "WillMsg",
      payload: "Connection Closed abnormally..!",
      qos: 0,
      retain: false,
    },
    rejectUnauthorized: false,
  };

  const buttonsStyle = {
    marginTop: "5px",
    marginLeft: "10px",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
  };

  useEffect(() => {
    connectBtn === "Connected"
      ? setFormFieldsDisabled("disabled")
      : setFormFieldsDisabled("");
  }, [connectBtn]);

  const onFinish = (values) => {
    const { host, clientId, port, username, password } = values;
    const url = `ws://${host}:${port}/mqtt`;
    options.clientId = clientId;
    options.username = username;
    options.password = password;

    connect(url, options);
  };

  const handleConnect = () => {
    form.submit();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const toggleDetailsDisplayProperty = () => {
    detailsDisplayProperty === "none"
      ? setDetailsDisplayProperty("block")
      : setDetailsDisplayProperty("none");
  };

  const Details = (
    <Row style={{ display: detailsDisplayProperty }}>
      <Col span={24}>
        <h6 style={{ width: "100%", textAlign: "center" }}>Details</h6>
        <Row gutter={20}>
          <Col span={12}>
            <Form.Item label="Host" name="host">
              <Input disabled={formFieldsDisabled} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Port" name="port">
              <Input disabled={formFieldsDisabled} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Client ID" name="clientId">
              <Input disabled={formFieldsDisabled} />
            </Form.Item>
          </Col>
        </Row>
      </Col>
    </Row>
  );

  return (
    <Card title={`Connection: ${connectBtn}`}>
      <Form
        layout="vertical"
        name="basic"
        form={form}
        initialValues={record}
        onFinish={onFinish}
      >
        <Row>
          <Col span={11}>
            <Form.Item label="Username" name="username">
              <Input disabled={formFieldsDisabled} />
            </Form.Item>
          </Col>
          <Col span={6} style={buttonsStyle}>
            {connectBtn === "Connected" ? (
              <Button block danger onClick={handleDisconnect}>
                Disconnect
              </Button>
            ) : (
              <Button block type="primary" onClick={handleConnect}>
                Connect
              </Button>
            )}
          </Col>
          <Col span={6} style={buttonsStyle}>
            <Button
              block
              type="secondary"
              onClick={() => {
                toggleDetailsDisplayProperty();
              }}
            >
              Modify
            </Button>
          </Col>
        </Row>
        {Details}
      </Form>
    </Card>
  );
};

export default Connection;