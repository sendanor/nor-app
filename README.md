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
