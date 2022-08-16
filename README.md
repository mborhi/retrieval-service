# Retrieval Service

This is a microservice to fetch categories, genres, category playlists, and genre playlists.

## Table of Contents
* [Development](#development)
    + [Architecture](#architecture)
* [Deploying](#deploying)
    + [Docker](#docker)
* [Contributing](#contributing)
    + [Adding Features](#adding-features)


## Development
API documentation can be found on Postman.

### Architecture

This microservice exposes four endpoints. Two for retrieving tracks and information of genres, and two for retrieving tracks and infromation of categories.

---

## Deploying

You can clone this repository, install dependencies, and use `npm run start:dev` to start the server. Upong changes to the code the server will automatically restart and refresh. Using `npm run start:prod` will try to run the server with the transpiled typescript code in the build directory. To transiple the code, use `npm run tsc`.

### Docker

You can either pull this docker image from mborhi/distributed-spotify-discover/retrieval-service, or build it yourself using `docker build .` while in the root of the directory.

---

## Contributing

### Adding Features

---


