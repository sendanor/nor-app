Sendanor App Project

* Trello board: https://trello.com/b/MHiSILez

### Install

Install `nor-nopg`: 

```
npm install -g nor-nopg
```

Install `nor-app`: 

```
npm install -g nor-app
```

Create a PostgreSQL database with these extensions:

```
CREATE EXTENSION plv8;
CREATE EXTENSION "uuid-ossp";
CREATE EXTENSION tcn;
CREATE EXTENSION moddatetime;
```

Name your application (default name is `nor-app`): 

```
export APPNAME='myapp'
```

Set it as `PGCONFIG` environment variable: 

```
export PGCONFIG='postgres://app:password@localhost/app'
```

Initialize NoPG:

```
nor-nopg init
```

Start the server (by default at port 3000):

```
nor-app start
```

Check log files at `~/.nor-app/logs/myapp/`.

Open browser at http://localhost:3000

... and create your database in the browser...

... and access REST interface from: http://localhost:3000/api/

### Testing

We recommend using [jsonview](https://chrome.google.com/webstore/detail/jsonview/chklaanhfefbnpoihckbnefhakgolnmc) when working in Google Chrome.

#### Testing with `curl`

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
