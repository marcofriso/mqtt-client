# MQTT client

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Note

Use NPM 14.15.1 or similar (MQTT specifies Node 12 or 14 in the documentation)

## Run

- `npm start

## Funtionality

- [x] track users online and flag the ones that have left/disconnected. This can be done by periodically broadcasting a message to a ‘users’ queue and the apps should track the user broadcasts, and if one has not been received by a user in a predefined amount of time, the user should be marked offline. (Each user send a message every 5 seconds and verify if the other users have done the same succesfully in the the last 7.5 seconds)
- [ ] after connection subscribe to:
  - `/topic/chatserver101/presence`
  - `/topic/chatserver101/public`
  - `/topic/chatserver101/priv/<username>`
    - Applications should publish to this but only one application (with the same username) can subscribe to it.
  - [x] BUG: change the topics name
- [ ] Allow a simple ‘Connect’ button to connect to the default (see proposed public MQTT service) or customize if necessary. Prerequisite to have the user enter a name (username) for the use of the application.
  - [ ] BUG:  Fix the reconnection with different username
- [x] A list of participants, and “--all--” on top (preselected) on the right area.
A text area, flowing, readonly, showing the last 1000 messages.
If a message was sent privately, it should have a lock icon 🔒 between the “:” and the text. If a user clicks on a user (e.g. John) the message will be sent to him privately, and the selection will remain there until the user picks either another user or “all”.
If a user appears disconnected (no broadcast received) his name will have 🚫 next to their name.
- [x] Send button, sending to either all or an individual. The choice depends on whether someone has selected the “all” or an individual from the list.
If a user has been selected, the button changes to “Send to <username>” otherwise remains “Send to All”
- [x] Depending on the button shown, the message should be sent to the respective “topic” – see “Topics” section above. The application should listen/subscribe to both the public and the username one, so it can receive private messages.
  - Normal flow - public
    - The user selects “-all-”
    - The button changes to “Send to All”
    - The text does not get cleared
    - The button cannot be pressed if the text is empty
    - The text will be published to the public topic (see topics)
  - Normal flow - private
    - The user selects a user e.g. “John”
    - The button changes to “Send to John”
    - The text does not get cleared
    - The button cannot be pressed if the text is empty
    - The text will be published to the “John” specific topic (see topics)
  - [x] BUG: disable button if text is empty
- [ ] A logbook of your actions should be provided with approximate time taken
