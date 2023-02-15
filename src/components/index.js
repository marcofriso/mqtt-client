import React, { createContext, useEffect, useState, useCallback } from "react";
import Connection from "./Connection";
import Publisher from "./Publisher";
import Receiver from "./Receiver";
import mqtt from "mqtt";
import { presenceTopic, privateTopic, publicTopic } from "../utils";

export const QosOption = createContext([]);
const availabilityCheckInterval = 5000;

const HookMqtt = () => {
  const [client, setClient] = useState(null);
  const [isPresenceSubed, setPresenceIsSub] = useState(false);
  const [payload, setPayload] = useState({});
  const [connectStatus, setConnectStatus] = useState("Disconnected");
  const [username, setUsername] = useState("");
  const [topic, setTopic] = useState(publicTopic);

  const mqttConnect = (host, mqttOption) => {
    setConnectStatus("Connecting");
    setClient(mqtt.connect(host, mqttOption));
  };

  const mqttDisconnect = () => {
    if (client) {
      client.end(() => {
        setConnectStatus("Disconnected");
      });
    }
  };

  const mqttPublish = useCallback(
    ({ topic, payload }) => {
      if (client) {
        client.publish(topic, payload, { qos: 1 }, (error) => {
          if (error) {
            console.log("Publish error: ", error);
          }
        });
      }
    },
    [client]
  );

  const mqttSub = useCallback(
    (subscription) => {
      if (client) {
        const { topic } = subscription;
        client.subscribe(topic, { qos: 1 }, (error) => {
          if (error) {
            console.log("Subscribe to topics error", error);
            return;
          }

          if (topic === presenceTopic) setPresenceIsSub(true);

          if (!error) {
            console.log(`${username} subscribed to ${topic} successfully`);
          }
        });
      }
    },
    [client, username]
  );

  useEffect(() => {
    if (connectStatus === "Connected") {
      const keepUserAvailablePublisher = () => {
        const payload = {
          datetime: new Date(),
          username,
        };

        mqttPublish({
          topic: presenceTopic,
          payload: JSON.stringify(payload),
        });
      };

      keepUserAvailablePublisher();

      const kUAPInterval = setInterval(
        () => keepUserAvailablePublisher(),
        availabilityCheckInterval
      );

      return () => {
        clearInterval(kUAPInterval);
      };
    }
  }, [mqttPublish, username, connectStatus]);

  useEffect(() => {
    if (client) {
      client.on("connect", () => {
        setConnectStatus("Connected");
      });
      client.on("error", (err) => {
        console.error("Connection error: ", err);
        client.end();
      });
      client.on("reconnect", () => {
        setConnectStatus("Reconnecting");
      });
      client.on("message", (topic, message) => {
        const payload = { topic, message: message.toString() };

        setPayload(payload);
      });
    }
  }, [client]);

  useEffect(() => {
    if (connectStatus === "Connected") {
      mqttSub({ topic: presenceTopic });
      mqttSub({ topic: publicTopic });
      mqttSub({ topic: `${privateTopic}${username}` });
    }
    return;
  }, [username, connectStatus, mqttSub]);

  return (
    <>
      <Connection
        connect={mqttConnect}
        disconnect={mqttDisconnect}
        connectionStatus={connectStatus}
        setUsername={setUsername}
        connectedUser={username}
      />
      <Publisher
        publish={mqttPublish}
        topic={topic}
        username={username}
        connectStatus={connectStatus}
      />
      <Receiver
        payload={payload}
        availabilityCheckInterval={availabilityCheckInterval}
        isPresenceSubed={isPresenceSubed}
        username={username}
        connected={connectStatus}
        topic={topic}
        setTopic={setTopic}
      />
    </>
  );
};

export default HookMqtt;
