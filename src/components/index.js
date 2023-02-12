import React, { createContext, useEffect, useState, useCallback } from "react";
import Connection from "./Connection";
import Publisher from "./Publisher";
import Subscriber from "./Subscriber";
import Receiver from "./Receiver";
import mqtt from "mqtt";

export const QosOption = createContext([]);
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
  const [isSubed, setIsSub] = useState(false);
  const [payload, setPayload] = useState({});
  const [connectStatus, setConnectStatus] = useState("Disconnected");
  const [username, setUsername] = useState("");

  const mqttConnect = (host, mqttOption) => {
    setConnectStatus("Connecting");
    setClient(mqtt.connect(host, mqttOption));
  };

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
        setPayload(payload);
      });
    }
  }, [client]);

  const mqttDisconnect = () => {
    if (client) {
      client.end(() => {
        setConnectStatus("Disconnected");
      });
    }
  };

  const mqttPublish = (context) => {
    if (client) {
      const { topic, payload } = context;

      const payload2 = JSON.stringify({ message: payload, userId: "XXXY" });
      client.publish(topic, payload2, { qos: 1 }, (error) => {
        if (error) {
          console.log("Publish error: ", error);
        }
      });
    }
  };

  const mqttSub = useCallback(
    (subscription) => {
      if (client) {
        const { topic, qos } = subscription;
        client.subscribe(topic, { qos: 1 }, (error) => {
          if (error) {
            console.log("Subscribe to topics error", error);
            return;
          }
          console.log("SUBSCRIBED", subscription);

          setIsSub(true);

          if (!error) {
            client.publish("testtopic/react", JSON.stringify(`Test MODICA`));
          }
        });
      }
    },
    [client]
  );

  useEffect(() => {
    if (connectStatus === "Connected") {
      console.log("RUN", username);
      mqttSub({ topic: "presence" });
      mqttSub({ topic: "public" });
      mqttSub({ topic: username });
    }
  }, [username, connectStatus, mqttSub]);

  const mqttUnSub = (subscription) => {
    if (client) {
      const { topic } = subscription;
      client.unsubscribe(topic, (error) => {
        if (error) {
          console.log("Unsubscribe error", error);
          return;
        }

        setIsSub(false);
      });
    }
  };

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
        <Subscriber sub={mqttSub} unSub={mqttUnSub} showUnsub={isSubed} />
        <Publisher publish={mqttPublish} />
      </QosOption.Provider>
      {console.log("MESSAGE PAYLOAD", payload)}
      <Receiver payload={payload} />
    </>
  );
};

export default HookMqtt;
