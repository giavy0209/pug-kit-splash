# BrayLeinoSplash Boilerplate For Frontend

BrayLeinoSplash Boilerplate For Frontend is a boilerplate for starting new project from frontend side.

## Features


## Requirements


## Install From Source

First, clone the project:

```bash
$ git clone <link><my-project-name>
```

```bash
$ cd <my-project-name>
$ yarn install
```

## Running Your Local Server With Gulp

```bash
$ yarn dev
```

## Build Files

```bash
$ yarn build
```

## Deploy files which built to UAT

- Note:

```bash
$ yarn deploy
```

## Build and deploy combination

```bash
$ yarn build-deploy
```

## Built lodash based on specific project

```bash
lodash include="each,filter,map,debounce,find,flatten,slice,findLast,findIndex,findLastIndex,includes,reduce,without" -o ./app/scripts/lodash.js && rm -rf ./app/scripts/lodash.js
```

## The public/ Contents with HTTPS

- Enter following script in terminal

```bash
$ openssl genrsa -des3 -out rootCA.key 2048 && openssl req -x509 -new -nodes -key rootCA.key -sha256 -days 1024 -out rootCA.pem
```

- Open Keychain Access on your Mac, import the `rootCA.pem` using `File > Import Items`. Double click the imported certificate and `change the “When using this certificate:” dropdown to Always Trust in the Trust section`.

- Create a new OpenSSL configuration file `server.csr.cnf` in root folder

```
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn

[dn]
C=US
ST=RandomState
L=RandomCity
O=RandomOrganization
OU=RandomOrganizationUnit
emailAddress=hello@example.com
CN = localhost
```

- Create a `v3.ext` in root folder

```
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
```

- Run the script

```bash
$ openssl req -new -sha256 -nodes -out server.csr -newkey rsa:2048 -keyout server.key -config <( cat server.csr.cnf ) && openssl x509 -req -in server.csr -CA rootCA.pem -CAkey rootCA.key -CAcreateserial -out server.crt -days 500 -sha256 -extfile v3.ext`
```

- Start developing process in https protocol

```bash
$ yarn dev-https
```

Reference source: [How to get HTTPS working on your local development environment in 5 minutes](https://medium.freecodecamp.org/how-to-get-https-working-on-your-local-development-environment-in-5-minutes-7af615770eec)

## Project Structure

The structure presented in this boilerplate is grouped primarily by folder content and file type. Please note that this structure is only meant to serve as a guide, it is by no means prescriptive.

```

```

## The public/ Contents

```

```
