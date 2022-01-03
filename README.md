# node-utils
Node utils for AffordPlan node servers.

## Using utils to create a new node server
- Create a new `Logger`.
- Create a new router (extension of util `Router`). The router will be registered with the APIs.
- Create a new `Server`.
- Call `server.start()` to start the server and it will start listening on the respective port.
 