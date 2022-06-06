# API Documentation

## Scheduler Notification Services

Core Stack : <br>

-   Express JS
-   Docker :whale:
-   MongoDB
-   Persistent Scheduler using Agenda
-   Private SMS API

    <br>

#### Before use this apps please follow below steps :

Native deployment :

-   Copy `.env.example` to `.env`
-   Run `npm install` or `yarn install`
-   Run `npm run dev or yarn dev`

Docker deployment :

-   Run `docker build -t 'youruser'/scheduler-sms-service`
    -   `youruser` is your dockerhub username
-   After successfuly build image , run `docker run --name scheduler-service -p 9000:9000 'yourusername'/scheduler-sms-service`

[Read The Docs](https://github.com/Maxxoto/FI-SchedulerService/blob/main/docs/en_docs.md#) <br><br>
