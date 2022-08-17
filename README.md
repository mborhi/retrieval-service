# Retrieval Service

This is a microservice to fetch categories, genres, playlists, tracks, and songs saved by the user.

## Table of Contents
* [Quick Start](#quick-start)
    + [Docker](#docker)
    + [GitHub](#github)
* [Service Architecture](#service-architecture)
    + [Endpoints](#endpoints)
    + [Utilities](#utilities)
        - [Category Endpoint Utilities](#category-endpoint-utilities)
        - [Genre Endpoint Utilities](#genre-endpoint-utilities)
        - [Playlist Endpoint Utilities](#playlist-endpoint-utilities)
* [Testing](#testing)

---

# Quick Start

This section explains how to get necessary files and deploy this app locally.

## Docker

The quickest way to run this app locally on your machine is to pull the `mborhi/spotify-quick-discover/retrieval-service` from Dockerhub. 

To do this, first make sure you have docker command tools installed your machine. Verify this by entering the following command in your terminal:

```
docker --version
```

If you get an error, you can install it on the official [Docker page](https://www.docker.com/get-started/).

Pull the image by entering the following command:

```
docker pull mborhi/spotify-quick-discover/retrieval-service 
```

You now have the Docker image installed. If you have the Docker desktop app installed you can simply head over to the Images section and click run beside the image you just pulled. Otherwise, you can run the image using the `run` command:

```
docker run --rm -dp 3000:3000 mborhi/spotify-quick-discover/retrieval-service
```

Verify that the image is successfully running by visiting http://localhost:3000 in your preferred browser.

To stop the container, use the command: 

```
docker stop mborhi/spotify-quick-discover/retrieval-service
```

## GitHub

Alternatively, you can clone this repository from GitHub and use the following commands to run the application on your local machine:

First install the necessary dependencies by running: `npm install`. Then, make sure to configure a `.env` file in the root of the directory, if you want to run the server on port different than 3000.

You are now ready to transpile and build the TypeScript files:

```
npm run tsc
```

Launch the server by using:

```
npm run start:prod
```

Verify that the server is live by visiting http://localhost:3000 in your preferred browser.

Simply press control-C in the terminal window running the server to stop the application.

---

# Service Architecture

This section outlines the architecture of this microservice, as well as its capabilities.

## Endpoints

This microservice exposes six endpoints. Two for retrieving tracks and information of genres, two for retrieving tracks and infromation of categories, and two for managing the saved tracks in the the user's playlist. 

* __/categories/__ 
    + GET request
    + retrieves available categories
* __/categories/:category_id__
    + GET request
    + retrieves tracks from the specfied category's playlists
* __/genres/__
    + GET request
    + retrieves available genres
* __/genres/:genre_id__
    + GET request
    + retrieves tracks from the specified genre
* __/playlist/__
    + GET request
    + retrieves the tracks saved in the user's "Quick Discover Finds" playlist
    + creates new playlist if user doesn't have one yet
* __/playlist/tracks__
    + POST request
        - adds the specified track to the user's playlist
        - creates new playlist if user doesn't have one yet
    + DEL request
        - removes the specified track from the user's playlist

You can find more documentation for these endpoints on the Postman [Spotify Quick Discover Microservices](https://www.postman.com/research-operator-51189562/workspace/spotify-quick-discover-microservices/overview) workspace page.

## Utilities

To fulfill the services of each endpoint, a couple utilties functions are used.

### Category Endpoint Utilities

To manage retrieving categories, a function fetches the relavent data from the Spotify Web API, and formats the data. This is then loaded into a Mongo database. If there are already categories stored within the database, instead of making another query to the Spotify API, the categories are loaded directly from the database. The database is updated every hour. Please see [fetch-categories.ts](./src/utils/categories/fetch-categories.ts) for implementation documenation.

To retrieve tracks from a specific category id, a function fetches that category's playlists. Another function then processes this data to aggregate all tracks from the all the playlists. Since playlists are updated frequently, this data is never stored. Please see [fetch-category-id.ts](./src/utils/categories/fetch-category-id.ts) for implementation documentation.

### Genre Endpoint Utilities

To manage retrieving genres, a function fetches the relavent data from the Spotify Web API, and formats the data. This is then loaded into a Mongo database. If there are already genres stored within the database, instead of making another query to the Spotify API, the genres are loaded directly from the database. The database is updated every hour. Please see [fetch-genres.ts](./src/utils/genres/fetch-genres.ts) for implementation documenation.

To retrieve tracks from a specific genre, a function uses the Spotify Web API's search endpoint to query for tracks matching that genre. This track data is then formatted. Please see [fetch-genre-id.ts](./src/utils/genres/fetch-genre-id.ts) for implementation documenation.

### Playlist Endpoint Utilities

Retrieving the user's playlist is done by first fetching all of the user's playlists and filtering for 'Quick Discover Finds' through the Spotify Web API. If this doesn't exist it will be created for the user. Once the playlist is obtained, the track information is processed the same way as for a [category playlist](#category-endpoint-utilities).

A single function is used to handle both user playlist track addtions and deletions.

---

# Testing

Endpoint testing is done on Postman through workflows: [Spotify Quick Discover Microservices](https://www.postman.com/research-operator-51189562/workspace/spotify-quick-discover-microservices/overview). 

Utility testing is completed using the Jest testing framework. 
