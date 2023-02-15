const presenceTopic = "/topic/chatserver101/presence";
const privateTopic = "/topic/chatserver101/priv/";
const publicTopic = "/topic/chatserver101/public";

const availabilityCheckInterval = 5000;
const maxMessagesListLength = 1000;

const isJson = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

export {
  availabilityCheckInterval,
  isJson,
  maxMessagesListLength,
  presenceTopic,
  privateTopic,
  publicTopic,
};
