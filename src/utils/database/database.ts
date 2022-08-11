import { Db, MongoClient } from 'mongodb'
import endpoints from '../../../endpoints.config';

const uri = endpoints.MongoURI;
const db_name = endpoints.MongoDB;

if (!uri) {
    throw new Error('Please add your Mongo URI to .env.local')
}

if (!db_name) {
    throw new Error('Please define the MONGODB_DB environment variable inside .env.local');
}

let cached = global.mongo;

if (!cached) {
    cached = global.mongo = { conn: null, promise: null }
}

/**
 * Connects to the database specified in the env file
 * @returns the connection to the database
 */
export async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = MongoClient.connect(uri).then((client) => {
            return {
                client,
                db: client.db(process.env.MONGODB_DB),
            }
        })
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

// TODO: function to check whether entries have expires_in dates which are older than a week, remove if they are

/**
 * Finds one entry using the given query from the specified collection of the database
 * @param {string} collection the collection in the database to query from
 * @param {any} query the search query
 * @param {Db} [database = undefined] the database to query
 * @returns the result of the search
 */
export const queryDatabase = async (collection: string, query: any, database: Db = undefined) => {
    let db: Db;
    if (database) {
        db = database;
    } else {
        let connection = await connectToDatabase();
        db = await connection.db;
    }
    // const { db } = await connectToDatabase();
    const result = await db.collection(collection).findOne(query);
    const data = await result;
    if (data === null) {
        // throw new Error("no results match query");
        return { "error": "no results match query" };
    }
    return data;
}