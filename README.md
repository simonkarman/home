# Karman Home
A set of applications that function as a home server for running fullstack workloads.

You can find the landing page at: [home.karman.dev](https://home.karman.dev)

The Karman Home stack uses nginx as a reverse proxy, Let's Encrypt for the tls certificates, microservice build using NodeJS TypeScript with the Express framework, and Typescripted React for the frontend web applications. The overal architecture is described in the image below.

![Architecture](architecture.png)

## Running Karman Home
Start the applications using docker-compose:
```bash
docker-compose up --build --remove-orphans -d
```

Stop the application like this:
```bash
docker-compose down
```