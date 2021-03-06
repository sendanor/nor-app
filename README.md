[![view on npm](http://img.shields.io/npm/v/nor-app.svg)](https://www.npmjs.org/package/nor-app)
[![npm module downloads](http://img.shields.io/npm/dt/nor-app.svg)](https://www.npmjs.org/package/nor-app)
[![Dependency Status](https://david-dm.org/sendanor/nor-app.svg)](https://david-dm.org/sendanor/nor-app)
<!---
[![Build Status](https://travis-ci.org/sendanor/nor-app.svg?branch=master)](https://travis-ci.org/sendanor/nor-app)
[![Coverage Status](https://coveralls.io/repos/github/sendanor/nor-app/badge.svg?branch=master)](https://coveralls.io/github/sendanor/nor-app?branch=master)
-->

nor-app -- Hypermedia App Server
================================

`nor-app` provides a HTTP interface in to a [nor-nopg 
database](https://github.com/sendanor/nor-nopg) -- which provides noSQL features in a 
PostgreSQL database server.

### Features

* Web based UI to maintain document types with [JSON Schema](http://json-schema.org/)
* Web interface to create, search, edit and delete documents
* Maintains a hypermedia JSON REST API for the data

### See also

* [nopg](https://github.com/sendanor/nor-nopg-cli) -- Shell scripting CLI for nor-nopg

### Requirements

* Ubuntu Linux LTS 14.04 (other Linux systems probably work, too)
* [Node.js v4.4.](http://nodejs.org)
* [PostgreSQL 9.3 Server](https://www.postgresql.org/), with extensions:
  * `pvl8`
  * `uuid-ossp`
  * `tcn`
  * `moddatetime`
* See other dependencies from [the NPM registry](https://www.npmjs.com/package/nor-app)

### Development

* Trello board: https://trello.com/b/MHiSILez

### Install

#### Installing globally

Install `nor-nopg`: 

```
npm install -g nor-nopg
```

Install `nor-app`: 

```
npm install -g nor-app
```

#### Creating a database

Create a PostgreSQL database with these extensions:

```
CREATE EXTENSION plv8;
CREATE EXTENSION "uuid-ossp";
CREATE EXTENSION tcn;
CREATE EXTENSION moddatetime;
```

Set your database configurations into a `PGCONFIG` environment variable: 

```
export PGCONFIG='postgres://app:password@localhost/app'
```

#### Setting name and port

Name your application (default name is `nor-app`): 

```
export APPNAME='myapp'
```

You can also change your application port (default port is `3000`):

```
export PORT='8080'
```

#### Initializing NoPG

```
nor-nopg init
```

#### Start the server

```
nor-app start
```

Check the logs at `~/.nor-app/logs/myapp/`. 

If there's any problems, just [create an issue](https://github.com/sendanor/nor-app/issues).

#### Create admin user

```
nor-app-useradd --email='demo@example.com'
```

Write down the password, you need it to login :)

#### Installing as a dependency

You may want to use `nor-app` as a dependency instead of a global command.

Create a directory for your project and initialize NPM there:

```
mkdir myapp
cd myapp
npm init
npm install --save nor-nopg
npm install --save nor-app
```

...then edit `scripts` section in your `./package.json` to look like this:

```json
{
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "init": "nor-nopg init",
    "start": "nor-app start",
    "stop": "nor-app stop"
  }
}
```

After that, you can initialize the NoPg database with a command 
`npm run init` instead of `nor-nopg init` and start the server simply 
with a command `npm start` and stop it `npm stop`.

### After installation

Open your browser at http://localhost:3000 and login

... and design your database in the browser...

... and access REST interface from: http://localhost:3000/api/

### Troubleshooting

If something doesn't work, check log files at `~/.nor-app/logs/myapp/`.

### Testing API

We recommend using [jsonview](https://chrome.google.com/webstore/detail/jsonview/chklaanhfefbnpoihckbnefhakgolnmc) when working in Google Chrome.

#### Testing API with `curl`

We also have a curl wrapper `./tools/curl` which makes it easier to work with our API.

Easiest way to get a cookie is from logged in session using Google Chrome's inspector. 

Copy the value of `connect.sid`:

```
npm config set nor-app:curl_cookie 'connect.sid=your-value-here'
```

Then you can use the api:

```
./tools/curl http://localhost:3000/api/
```

