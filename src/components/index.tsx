import React, { createContext, useEffect, useState, useCallback } from "react";
import Connection from "./Connection";
import Publisher from "./Publisher";
import Receiver from "./Receiver";
import mqtt, { IClientOptions, MqttClient } from "mqtt";
import {
  availabilityCheckInterval,
  presenceTopic,
  privateTopic,
  publicTopic,
} from "../utils";

export const QosOption = createContext([]);

const HookMqtt = () => {
  const [client, setClient] = useState<MqttClient | null>(null);
  const [isPresenceSubed, setPresenceIsSub] = useState(false);
  const [payload, setPayload] = useState({ topic: "", message: "" });
  const [connectStatus, setConnectStatus] = useState("Disconnected");
  const [username, setUsername] = useState("");
  const [topic, setTopic] = useState(publicTopic);

  const mqttConnect = (host: string, mqttOption: IClientOptions) => {
    setConnectStatus("Connecting");

    setClient(mqtt.connect(host, mqttOption));
  };

  const mqttDisconnect = () => {
    if (client) {
      // @ts-ignore
      client.end(() => {
        setConnectStatus("Disconnected");
      });
      setPresenceIsSub(false);
      setClient(null);
    }
  };

  const mqttPublish = useCallback(
    ({ topic, payload }: { topic: string; payload: string | Buffer }) => {
      if (client) {
        // console.log("PUBLISH");
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
    ({ topic }: { topic: string }) => {
      if (client) {
        client.subscribe(topic, { qos: 1 }, (error) => {
          if (error) {
            console.log("Subscribe to topics error", error);
            return;
          } else {
            if (topic === presenceTopic) setPresenceIsSub(true);
            console.log(`${username} subscribed to ${topic} successfully`);
          }
        });
      }
    },
    [client, username]
  );

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
        // client reconnect does not appear to be working properly
        client.end();
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
  }, [username, connectStatus, mqttSub]);

  useEffect(() => {
    if (isPresenceSubed) {
      const keepUserAvailablePublisher = () => {
        console.log("RUNS-KEEP");
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
  }, [mqttPublish, username, isPresenceSubed]);

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
