### Local Installation

First you need to install Oracle Instant Client locally.

How to do it, you can see here https://github.com/oracle/node-oracledb#-installation

```sh
git clone git@github.com:apechkin/express-oracle.git
cd express-oracle
npm install
```
In project path create .env file, with your configuration, for example

```sh
DB_HOST_PROD=192.168.1.10
DB_USER_PROD=YOUR_DB_USER
DB_PASS_PROD=YOUR_DB_PASS

DB_HOST_DEV=192.168.1.25
DB_USER_DEV=YOUR_DB_DEV_USER
DB_PASS_DEV=YOUR_DB_DEV_PASS

DB_PORT=1521
DB_SERVICE=YOU_SERVICE_NAME

NODE_PORT=1337
```
To test application in developments mode, run command:

```sh
npm run watch
```

For production environments

```sh
NODE_ENV=production npm run start
```

### Docker

```sh
git clone git@github.com:apechkin/express-oracle.git
cd express-oracle
```

In project path create .env file, with your configuration, for example

```sh
DB_HOST_PROD=192.168.1.10
DB_USER_PROD=YOUR_DB_USER
DB_PASS_PROD=YOUR_DB_PASS

DB_HOST_DEV=192.168.1.25
DB_USER_DEV=YOUR_DB_DEV_USER
DB_PASS_DEV=YOUR_DB_DEV_PASS

DB_PORT=1521
DB_SERVICE=YOU_SERVICE_NAME

NODE_PORT=1337
```
Then run command:
```sh
docker build --tag exoracle .
```
This will create the exoracle image and pull in the necessary dependencies.

Once done, run the Docker image and map the port to whatever you wish on your host. In this example, we simply map port 3000 of the host to port 1337 of the Docker:

```sh
docker run -d -p 3000:1337 --restart="always" exoracle
```

Verify the deployment by navigating to your server address in your preferred browser.

```sh
127.0.0.1:3000
```
