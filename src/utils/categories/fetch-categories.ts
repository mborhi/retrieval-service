import { CollectionMember } from "../../../interfaces";
import { stringify } from "querystring";
import endpointsConfig from "../../../endpoints.config";
import { connectToDatabase } from "../database/database";
import { Db, MongoClient } from "mongodb";

/**
 * Retrieves a list of categories 
 * @param {string} access_token an OAuth2 access token of the user requesting this resource
 * @param {MongoClient} [database] optional. the database to load categories from
 * @returns {Promise<CollectionMember[]>} the list of categories
 */
export const loadCategories = async (access_token: string, database: Db = undefined): Promise<CollectionMember[]> => {
    // const { db } = await connectToDatabase();
    let db;
    if (database) {
        db = database;
    } else {
        let connection = await connectToDatabase();
        db = await connection.db;
    }
    const data = await db.collection('categories').find({}).limit(50).toArray();
    let result = await data;
    // get the time categories was last updated
    const categoriesUpdates = await db.collection('collectionsUpdates').findOne({ name: "categories" });
    const lastUpdated = await categoriesUpdates.last_updated;
    // if the results are empty or database hasn't been updated, fetch from spotify and store results in database
    if (result.length === 0 || Date.now() - lastUpdated > 3600 * 1000) { // revalidate after one hour
        // make request for categories
        result = await getCategories(access_token);
        // purge all old data
        await db.collection('categories').deleteMany({});
        // insert into database
        await db.collection('categories').insertMany(result);
        // replace the old categories update
        await db.collection('collectionsUpdates').replaceOne({ name: "categories" }, { name: "categories", last_updated: Date.now() });
    }
    return JSON.parse(JSON.stringify(result));
}

/**
 * Returns a list of categories. 
 * Uses Get Several Browse Categories Spotify Web API call:
 * 
 * API Reference	https://developer.spotify.com/documentation/web-api/reference/#/operations/get-categories
 * 
 * Endpoint	        https://api.spotify.com/v1/browse/categories
 * 
 * HTTP Method	    GET
 *
 * OAuth	        Required
 * @param {string} token            the OAuth2 bearer access token of the user to make request with
 * @param {string} [country='US']   the country code to get categories from
 * @param {string} [locale='us_EN'] the locale code to get categories from
 * @param {number} [limit=50]       the number of categories for query to return
 * @returns {spotify_category[]}    a list of categories
 */
export const getCategories = async (token: string, country: string = 'US', locale: string = 'us_EN', limit: number = 50): Promise<CollectionMember[]> => {
    const queryData = {
        country: country,
        locale: locale,
        limit: limit,
        offset: 0
    };
    let url = endpointsConfig.SpotifyAPIBaseURL + '/browse/categories?' + stringify(queryData);
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    });
    // console.log('response: ', await response.json());
    try {
        const data = await response.json();
        // console.log('received data: ', await data);
        const categories: CollectionMember[] = await data.categories.items;
        return categories;
    } catch (error) {
        console.error(error);
        return [];
    }
}