# ProfessorBot

A web service that operates both Discord bot for alerting ITAS students to assignment deadlines/test dates and a web page that allows student or instructors to view and add assignments.

## Technologies Implemented
Typescript, Bootstrap 4, JQuery, Pug, NodeJS, Bootswatch SASS themes, Express server + middleware, various node modules.
This project was started using a fork of [Microsoft's TypeScript-Node-Starter Github repository](https://github.com/Microsoft/TypeScript-Node-Starter)

### LEGEND:
- ![#f03c15](https://placehold.it/15/f03c15/000000?text=+)  -  Not written by me

- ![#c5f015](https://placehold.it/15/c5f015/000000?text=+)  -  Modified by me

- ![#1589F0](https://placehold.it/15/1589F0/000000?text=+)  -  Written entirely by me

./src

├── app.ts ![#c5f015](https://placehold.it/15/c5f015/000000?text=+) - Primary code for the Express server. Registers middleware and defines server routes.

├── bot

│   ├── bot.ts ![#1589F0](https://placehold.it/15/1589F0/000000?text=+) - Primary code for bot behaviour. Defines commands and the responses thereto.

│   ├── config.ts ![#1589F0](https://placehold.it/15/1589F0/000000?text=+) - Configuration data for bot behaviour such as bot command prefix.

│   └── workers.ts ![#1589F0](https://placehold.it/15/1589F0/000000?text=+) - Continuously running worker code that decides when and how to notify subscribers.

├── config

│   └── passport.ts ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) - Code needed for user authentication middleware.

├── controllers

│   ├── assignment.ts ![#1589F0](https://placehold.it/15/1589F0/000000?text=+) - Assignment middleware. Contain functions for all endpoints dealing with assignment data.

│   ├── contact.ts ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) - Controller for "contact us" page

│   ├── home.ts ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) - Controller for home screen (minus the adding assignment functionality)

│   └── user.ts ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) - Controller for accepting logins and other user related actions

├── data

│   ├── assignments.ts ![#1589F0](https://placehold.it/15/1589F0/000000?text=+) - Helper module that provides pre-defined funcitons for interacting with assignment database

│   └── subscribers.ts ![#1589F0](https://placehold.it/15/1589F0/000000?text=+) - Same as above but for subscriber database

├── db

│   └── mongoose.ts ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) - Mongoose (database modeler) initialization

├── models

│   ├── Assignment.ts ![#1589F0](https://placehold.it/15/1589F0/000000?text=+) - Mongoose model for assignments (defines the allowable data in Assignment collection)

│   ├── Subscriber.ts ![#1589F0](https://placehold.it/15/1589F0/000000?text=+) - Same as above but for subscriber collection (containing Discord ID and subscription preferences)

│   └── User.ts ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) - Model for user database. (May be modified to reference subscriber collection in the future)

├── public

│   ├── css

│   │   ├── lib

│   │   │   ├── bootstrap/ ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) - Bootstrap library. Upgraded from Bootstrap 3 to 4.

│   │   └── themes/ ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) - (folder) Bootswatch themes. Can be selected in main.scss (see https://bootswatch.com/)

│   ├── fonts/ ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) - (folder) Font-Awesome files - provides fonts as well as icons

│   ├── images ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) - (folder) Public image resources

│   └── js

│       ├── lib

│       │   ├── bootstrap.bundle.min.js ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) - Hosted Bootstrap bundle resource. Opted to host this file rather than use CDN.

│       │   └── jquery-3.1.1.min.js ![#f03c15](https://placehold.it/15/f03c15/000000?text=+)  - Hosted JQuery bundle resource. Opted to host this file rather than use CDN.

│       ├── main.ts ![#1589F0](https://placehold.it/15/1589F0/000000?text=+) - Front-end javascript. Suprisingly little needed.

├── server.ts ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) - Server initialization file

├── types/ ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) - (folder) Typescript type definition files that needed to be downloaded separately from the main dependency

└── util

   ├── helpers.ts ![#1589F0](https://placehold.it/15/1589F0/000000?text=+) - Miscellaneous back-end typescript functions

   ├── logger.ts ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) - Winston logging, not yet used

   └── secrets.ts ![#c5f015](https://placehold.it/15/c5f015/000000?text=+) - Sets environment variables using .env file and makes sure these secret keys are present.




40 directories, 179 files


