import React, { createContext, useEffect, useState, useCallback } from "react";
import Connection from "./Connection";
import Publisher from "./Publisher";
import Receiver from "./Receiver";
import mqtt from "mqtt";

export const QosOption = createContext([]);
const availabilityCheckInterval = 5000;

const qosOption = [
  {
    label: "0",
    value: 0,
  },
  {
    label: "1",
    value: 1,
  },
  {
    label: "2",
    value: 2,
  },
];

const HookMqtt = () => {
  const [client, setClient] = useState(null);
  const [isPresenceSubed, setPresenceIsSub] = useState(false);
  const [payload, setPayload] = useState({});
  const [connectStatus, setConnectStatus] = useState("Disconnected");
  const [username, setUsername] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("public");

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

          if (topic === "presence") setPresenceIsSub(true);

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
          topic: "presence",
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
      client.on("message", (topic, message, packet) => {
        const payload = { topic, message: message.toString() };
        // console.log("Message", payload);

        setPayload(payload);
      });
    }
  }, [client]);

  useEffect(() => {
    if (connectStatus === "Connected") {
      mqttSub({ topic: "presence" });
      mqttSub({ topic: "public" });
      mqttSub({ topic: username });
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
      <QosOption.Provider value={qosOption}>
        <Publisher
          publish={mqttPublish}
          selectedTopic={selectedTopic}
          username={username}
        />
      </QosOption.Provider>
      <Receiver
        payload={payload}
        availabilityCheckInterval={availabilityCheckInterval}
        isPresenceSubed={isPresenceSubed}
        username={username}
        connected={connectStatus}
      />
    </>
  );
};

export default HookMqtt;
