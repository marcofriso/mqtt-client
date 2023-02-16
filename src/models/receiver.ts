interface Payload {
  topic: string;
  message: string;
}

interface ReceiverProps {
  payload: Payload;
  isPresenceSubed: boolean;
  connected: string;
  username: string;
  setTopic: Function;
  topic: string;
}

interface PresencePayloadMessage {
  datetime: string;
  username: string;
}

export type { Payload, PresencePayloadMessage, ReceiverProps };
