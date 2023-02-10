# MQTT client

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Note

Use NPM 14.15.1 or similar

## Run

- `npm start

## Funtionality


1. Input as in the image and change the ClientID to something unique; username/password are not necessary for the public folder
2. Use ‘Connect’ to link to the server à it should change to “Connected”
3. Use ‘Subscribe’ to subscribe to a topic (example topic provided but do as you
wish)
4. Enter text payload and press ‘Publish’ – it will go to the MQTT server and appear
back to the subscribed topic listeners. If you have subscribed to the same topic
you should see the message appear in ‘Receiver’
5. The messages shown on this tab are messages sent to the topic you have
subscribed above.

## Extra

The application should track the users already online and flag the ones that have left/disconnected. This can be done by periodically broadcasting a message to a ‘users’ queue and the apps should track the user broadcasts, and if one has not been received by a user in a predefined amount of time, the user should be marked offline.

