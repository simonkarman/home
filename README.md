# Karman Home
Karman Home is a set of applications that functions as a home server, which means that it is meant to run on a computer in your local network. Currently Karman Home provides user identity and chat message functionalities.

> Note: You can find the landing page at: [home.karman.dev](https://home.karman.dev). If it is offline, you can run Karman Home yourself by following the 'Running Karman Home' documentation below.

The following image shows all the components that make up Karman Home.

![Architecture](architecture.png)

The reverse proxy, build using nginx (http), Pushpin (websockets) and the scripts, can be found in the `ingress/` directory

The microservices, build using NodeJS TypeScript with the Express framework, can be found in the `identity/api/` and `chat/api/` directories.

The frontend web applications, build using React in Typescript, can be found in the `identity/ui/` and `chat/ui/` directories.

## Running Karman Home
1. Replace any references to `karman.dev` in the code with your own domain name.

2. Set up your DNS provider to point to the ip address of your home router and forward this traffic (ports 80 and 443) from your router to the machine that will be running Karman Home. You can find an automated script for this in `ingress/dns`. Note that this currently only supports a [ZYXEL router](https://www.zyxel.com/) and the [NeoStrada api](https://www.neostrada.nl/support/artikel/hoe-gebruik-ik-de-api.html) for DNS management.

3. Generate a valid Let's Encrypt certificate for your domain name. More information can be found in `ingress/certificate`.

4. Run the application set using [docker-compose](https://docs.docker.com/compose/install/).
```bash
docker-compose up --build --remove-orphans -d
```

5. Add the following MongoDB collections to MongoDB running at `localhost:7017/` using [Mongo DB Compass](https://www.mongodb.com/products/compass):
   1. An empty collection: `chat/Messages`.
   2. A collection: `identity/Users` with the following data.
```json
[
   {
     "_id": { "$oid": "621d5d1267c4ae2108286042" },
     "username": "simon",
     "password": "$2b$10$8w6Ppy0HXa4n6Jp0dPiUrO0wv9hZHL5pYKaxWV35tpY6zh7B.uDWq",
     "scopes": [ "admin", "user" ]
   },
   {
     "_id": { "$oid": "621d5d1267c4ae2108286043" },
     "username": "lisa",
     "password": "$2b$10$JDIQgdDisrSRuDfRgAiFkuvVL24rpXwwyVZENY9Khf.p9dlvkZTp.",
     "scopes": [ "user" ]
   }
]
```

6. Go to `https://home.<your-domain-name>` using your favorite browser. You can find the identity and chat functionality from there, and when prompted you can log in as an admin with username `simon` and password `123` or log in as a user with username `lisa` and password `456`.

![Home Landing Page](docs/home.png)

7. To stop the application, run `docker-compose down` and disable the port forwarding and remove the DNS records your created in step 2. You can find an automated script for this in `ingress/dns`.

# Identity
The identity functionality providers users in Karman Home to login and logout. The identity functionality is available by visiting `https://identity.<your-domain-name>` in your browser.

> Note: If the `t` query parameter is added to the url (for example: `https://identity.<your-domain-name>?t=<another-url>`), then you'll be redirected to its value directly after login in.

![Home Identity](docs/identity.png)

# Chat
The chat functionality provides users in Karman Home to send and receive chat messages in a single global chat room. The chat functionality is available by visiting `https://chat.<your-domain-name>`.

> Note: Admins are able to delete messages, and new messages (or deletions) are received in realtime via a WebSocket connection.
 
![Home Chat](docs/chat.png)
