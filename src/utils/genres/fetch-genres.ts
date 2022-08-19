import fetch from 'node-fetch';
import { CollectionMember } from "../../../interfaces";
import { connectToDatabase } from "../../utils/database/database";
import endpoints from "../../../endpoints.config";
import { Db } from "mongodb";
import { dataIsError, responseIsError } from '../fetch-utils';

/**
 * Retrieves a list of genres
 * @param {string} token the OAuth2 bearer access_token of the user making the requeset
 * @param {database} [database] optional. the database to load genres from
 * @returns {Promise<CollectionMember[]>} the list of genres
 */
export const loadGenres = async (token: string, database: Db = undefined): Promise<CollectionMember[] | SpotifyApi.ErrorObject> => {
    // const { db } = await connectToDatabase();
    let db;
    if (database) {
        db = database;
    } else {
        let connection = await connectToDatabase();
        db = await connection.db;
    }
    const data = await db.collection('genres').find({}).toArray();
    const genreUpdates = await db.collection('collectionsUpdates').findOne({ name: "genres" });
    // the time when the genres collection was last updated 
    // TODO: store this in cache maybe
    const lastUpdated = await genreUpdates.last_updated;
    let result = await data;
    // add handling here for empty results, if the results are empty fetch from spotify
    if (result.length === 0 || Date.now() - lastUpdated > 3600 * 1000) { // if the database hasn't been updated in one hour
        // make request for genre seeds
        result = await getAvailableGenreSeeds(token);
        // check results for error
        if (dataIsError(result)) return result; // handle by endpoint
        // clear out all genres in the database
        await db.collection('genres').deleteMany({});
        // insert genres into database
        await db.collection('genres').insertMany(result);
        // replace the old timestamp with current time
        // await db.collection('genreUpdates').deleteMany({});
        await db.collection('collectionsUpdates').replaceOne({ name: "genres" }, { name: "genres", last_updated: Date.now() });
    }
    return JSON.parse(JSON.stringify(result));
}

/**
 * Returns a list of available genres.
 * Uses Get Available Genre Seeds Spotify Web API call:
 * 
 * API Reference	Get Available Genre Seeds
 * 
 * Endpoint	        https://api.spotify.com/v1/recommendations/available-genre-seeds
 * 
 * HTTP Method	    GET
 * 
 * OAuth	        Required
 * @param {string} token    the OAuth2 bearer access token of the user to make request with 
 * @returns {array}         list of genres
 */
const getAvailableGenreSeeds = async (token: string): Promise<CollectionMember[]> => {
    const url = endpoints.SpotifyAPIBaseURL + '/recommendations/available-genre-seeds';
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    });
    if (responseIsError(response)) return await response.json();
    try {
        const data: SpotifyApi.AvailableGenreSeedsResponse = await response.json();
        const genres: string[] = data.genres;
        // TOOD: turn this into type (this must comply with CollectionDisplay component)
        const results = genres.map(async (genre: string) => {
            return {
                id: genre,
                name: genre
            }
        });
        return await Promise.all(results);
    } catch (error) {
        console.log(error);
        return [];
    }
}