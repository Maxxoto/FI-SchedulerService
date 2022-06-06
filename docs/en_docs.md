All endpoints require no Authentication.

List Endpoint :

-   [Get All Scheduler](#) &nbsp;&nbsp; : GET /api/scheduler/
-   [Get Single Scheduler](#) &nbsp;&nbsp; : GET /api/scheduler/id:
-   [Create SMS Scheduler](#) &nbsp;&nbsp; : POST /api/scheduler/sms
-   [Get All SMS Scheduler](#) &nbsp;&nbsp; : GET /api/scheduler/sms
-   [Get Single SMS Scheduler](#) &nbsp;&nbsp; : GET /api/scheduler/sms/:id

### System Design

-   1 **scheduler** can have **multiple SMS** or **multiple scheduler type** , but for now is **hardcoded only 1 SMS due to the deadline**.
