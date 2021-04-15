# MyApp

## Initial setup


_Install Sequelize CLI_

`npm install -g sequelize-cli`

_Setup DB_

`createuser --superuser myapp`

`createdb myapp`

`sequelize db:migrate`

_Reset DB_

`sequelize db:migrate:undo:all`

`sequelize db:migrate`

## dotenv configuration

[dotenv](https://github.com/motdotla/dotenv) can be used to start server locally as all configuration is in environment variables: 

`node -r dotenv/config server/main.js`

Just create a **.env** file in repo folder and populate with configuration.

## Running unit tests

`npm install --global mocha`

Run `mocha test` to execute the mocha tests via [mocha](https://mochajs.org/#getting-started).
