# hissin-bastid - ITAS191 Final Project

A web service that operates both a web page and Discord bot for alerting ITAS students to assignment deadlines/test dates. This project is currently [deployed](http://hissin-bastid-prod.7r6myjvvzx.us-east-2.elasticbeanstalk.com ) on AWS Elastic Beanstalk.

## Usage
There are two primary means of interacting with this software. The first is by sending messages that can be read by a Discord bot that appears as a user within a Discord chat room and is processed within this program. The bot is currently live on personal Discord server but is intended to eventually run in the 2020 ITAS room. A user may decide to subscribe to assignment reminders via the ~subscribe command, which by default will have the bot message the user three, two, and one day before an assignment due date at noon. This behaviour may be customized by the user to send reminders earlier or later, at different intervals, and/or at a different time of the day.

The second means of interacting with this software is of course through the web server that runs in the same process. This web site allows users to add and view assignment data once they are signed up. This provides a more friendly means of adding assignments to the system eliminating the need to access the database through the provider. In the future a web scraper may be developed within this codebase to add assignment data automatically.

## Technologies Implemented
This project uses NodeJS, Typescript, Bootstrap 4, Bootswatch themes, JQuery, Pug, MongoDB/Mongoose, Express server + middleware and other various node modules. A fork of [Microsoft's TypeScript-Node-Starter Github repository](https://github.com/Microsoft/TypeScript-Node-Starter) was used as a starting point and a free-tier cloud database was provided by [MLab](https://mlab.com/) for production.

## Project Structure
 This is a full stack project including both front end and back end code and uses a Model View Controller (MVC) architecture. All of the production project-specific code exists in the src and view directories, and the contents of these directories are colour coded below to indicate what work was done by myself. The project must be built (*press ctrl+shift+b in VSCode*) prior to running, during which Typescript is transpiled into ES6 Javascript and Sass files are used to generate CSS all of which ends up in the dist folder. [Pug templating](https://pugjs.org/api/getting-started.html) is used to generate the HTML that appears in the user's browser. [Bootstrap 4](https://getbootstrap.com/) and [Bootswatch](https://bootswatch.com/) were updated to their latest versions and provide a modern look and feel as well as responsive design. Pug views were updated to support the updated Bootstrap syntax where necessary. Once built the process is started using the command *npm start*.

### LEGEND:
- ![#f03c15](https://placehold.it/15/f03c15/000000?text=+)  -  Not written by me

- ![#c5f015](https://placehold.it/15/c5f015/000000?text=+)  -  Modified by me

- ![#1589F0](https://placehold.it/15/1589F0/000000?text=+)  -  Written entirely or almost entirely by me

#### ./src

├── app.ts ![#c5f015](https://placehold.it/15/c5f015/000000?text=+) - Primary code for the Express server; registers middleware and defines server routes

├── bot

│   ├── bot.ts ![#1589F0](https://placehold.it/15/1589F0/000000?text=+) - Primary code for bot behaviour; defines commands and the responses thereto

│   ├── config.ts ![#1589F0](https://placehold.it/15/1589F0/000000?text=+) - Configuration data for bot behaviour such as bot command prefix

│   └── workers.ts ![#1589F0](https://placehold.it/15/1589F0/000000?text=+) - Continuously running worker code that decides when and how to notify subscribers

├── config

│   └── passport.ts ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) - Code needed for user authentication middleware

├── controllers

│   ├── assignment.ts ![#1589F0](https://placehold.it/15/1589F0/000000?text=+) - Assignment controller; contains functions for all endpoints dealing with assignment data

│   ├── contact.ts ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) - Controller for "contact us" page

│   ├── home.ts ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) - Controller for home screen (minus the adding assignment functionality)

│   └── user.ts ![#c5f015](https://placehold.it/15/c5f015/000000?text=+) - Controller for accepting logins and other user related actions - modified only the mailer used

├── data

│   ├── assignments.ts ![#1589F0](https://placehold.it/15/1589F0/000000?text=+) - Helper module that provides pre-defined funcitons for interacting with assignment database

│   └── subscribers.ts ![#1589F0](https://placehold.it/15/1589F0/000000?text=+) - Same as above but for subscriber database

├── db

│   └── mongoose.ts ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) - Mongoose (database modeler) initialization

├── models

│   ├── Assignment.ts ![#1589F0](https://placehold.it/15/1589F0/000000?text=+) - Mongoose model for assignments (defines the allowable data in Assignment collection)

│   ├── Subscriber.ts ![#1589F0](https://placehold.it/15/1589F0/000000?text=+) - Same as above but for subscriber collection (containing Discord ID and subscription preferences)

│   └── User.ts ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) - Model for user database (May be modified to reference subscriber collection in the future)

├── public

│   ├── css

│   │   ├── lib

│   │   │   ├── bootstrap/ ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) - Bootstrap library; upgraded from Bootstrap 3 to 4.

│   │   ├── themes/ ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) - (folder) Bootswatch themes; any of the themes within this folder can be selected in main.scss

|   |   └── main.scss ![#c5f015](https://placehold.it/15/c5f015/000000?text=+) - The main Sass file, the theme may be selected here

│   ├── fonts/ ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) - (folder) Font-Awesome files - provides fonts as well as icons

│   ├── images ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) - (folder) Public image resources

│   └── js

│       ├── lib

│       │   ├── bootstrap.bundle.min.js ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) - Hosted Bootstrap bundle resource; opted to host this file rather than use CDN

│       │   └── jquery-3.1.1.min.js ![#f03c15](https://placehold.it/15/f03c15/000000?text=+)  - Hosted JQuery bundle resource; opted to host this file rather than use CDN

│       ├── main.ts ![#1589F0](https://placehold.it/15/1589F0/000000?text=+) - Front-end javascript; currently verifies that entered dates are future dates and, allows separating out past due assignments, and enables editing/deleteing.

├── server.ts ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) - Server initialization file

├── types/ ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) - (folder) Typescript type definition files that needed to be downloaded separately from the main dependency

└── util

|   ├── helpers.ts ![#1589F0](https://placehold.it/15/1589F0/000000?text=+) - Miscellaneous back-end typescript functions

|   ├── logger.ts ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) - Winston logging; not yet used

|   └── secrets.ts ![#c5f015](https://placehold.it/15/c5f015/000000?text=+) - Sets environment variables using .env file and makes sure these secret keys are present


#### ./views

├── account/ ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) - (folder) All views for actions relating to user accounts (logging in etc)

├── api/ ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) - (folder) Unused feature of Typescript starter project

├── assignments.pug ![#1589F0](https://placehold.it/15/1589F0/000000?text=+) - Assignments page that displays a table of currently available assignment data

├── contact.pug  ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) - View for the Contact page

├── home.pug ![#1589F0](https://placehold.it/15/1589F0/000000?text=+) - Home page, modified heavily from original state in starter project

├── layout.pug ![#c5f015](https://placehold.it/15/c5f015/000000?text=+) - Page layout common across all pages, ties together flash, header, footer, and main content

└── partials

|   ├── flash.pug ![#c5f015](https://placehold.it/15/c5f015/000000?text=+) - Integrated with express-flash middleware to display messages to user

|   ├── footer.pug ![#c5f015](https://placehold.it/15/c5f015/000000?text=+) - Displays copyright and a GitHub star at the end of each page

|   └── header.pug ![#1589F0](https://placehold.it/15/1589F0/000000?text=+) - Navigation bar. Modified heavily from starter kit state.

