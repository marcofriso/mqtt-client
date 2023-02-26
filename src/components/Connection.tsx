import React, { useState, useEffect } from "react";
import { Card, Button, Form, Input, Row, Col } from "antd";
import { ConnectionProps, ConnectionFormValues } from "../models/connection";
import { IClientOptions } from "mqtt";

const Connection = ({
  connect,
  disconnect,
  connectionStatus,
  setUsername,
  connectedUser,
}: ConnectionProps) => {
  const [form] = Form.useForm();
  const [detailsDisplayProperty, setDetailsDisplayProperty] = useState("none");
  const [formFieldsDisabled, setFormFieldsDisabled] = useState(true);
  const [submitButtonDisabled, setSubmitButtondDisabled] = useState(false);

  const record = {
    host: "broker.emqx.io",
    clientId: `mqttjs_ + ${Math.random().toString(16).substr(2, 8)}`,
    port: 8083,
  };

  const options: IClientOptions = {
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
    connectionStatus === "Connected"
      ? setFormFieldsDisabled(true)
      : setFormFieldsDisabled(false);

    connectionStatus === "Connected" || connectionStatus === "Disconnected"
      ? setSubmitButtondDisabled(false)
      : setSubmitButtondDisabled(true);
  }, [connectionStatus]);

  const onFinish = (values: ConnectionFormValues) => {
    const { host, clientId, port, username } = values;
    const url = `ws://${host}:${port}/mqtt`;

    options.clientId = clientId;
    options.username = username;

    connect(url, options);
    setUsername(username);
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
    <Card title="Connection">
      <p style={{ marginBottom: "8px" }}>
        Connection status: {connectionStatus}
      </p>
      <p style={{ marginBottom: "20px" }}>
        Connected user: {connectedUser.length ? connectedUser : "N/A"}
      </p>
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
            {connectionStatus === "Connected" ? (
              <Button
                block
                danger
                onClick={handleDisconnect}
                disabled={submitButtonDisabled}
              >
                Disconnect
              </Button>
            ) : (
              <Button
                block
                type="primary"
                onClick={handleConnect}
                disabled={submitButtonDisabled}
              >
                Connect
              </Button>
            )}
          </Col>
          <Col span={6} style={buttonsStyle}>
            <Button
              block
              type="default"
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
