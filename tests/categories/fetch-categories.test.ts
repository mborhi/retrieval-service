import endpoints from '../../endpoints.config';
import { Db, MongoClient } from 'mongodb';
import { loadCategories } from '../../src/utils/categories/fetch-categories';
jest.mock('node-fetch');

import fetch from 'node-fetch';
const { Response } = jest.requireActual('node-fetch');

const mockedFetch = fetch as any;

describe("Fetch categories from database or make Spotify API call", () => {
    const mock_access_token = "mock-access-token";

    let connection: { db: (arg0: any) => Db | PromiseLike<Db>; close: () => any; };
    let db: Db;
    const expectedLength = 50;

    const generateMockCategories = (length: number) => {
        const mocks = [...Array(length).fill(1)].map((e, idx) => {
            return {
                "name": "mock_category" + idx
            }
        });
        return mocks
    }

    beforeAll(async () => {
        let promise = await MongoClient.connect(endpoints.MongoURI).then((client) => {
            return {
                client,
                db: client.db(endpoints.MockMongoDB),
            }
        });
        connection = promise.client;
        db = promise.db;

    });

    beforeEach(async () => {
        await db.collection('collectionsUpdates').insertOne({ "name": "categories", "last_updated": Date.now() });
    });

    afterEach(async () => {
        await db.collection('collectionsUpdates').deleteMany({});
    });

    afterAll(async () => {
        // purge collections and close db
        await db.collection('categories').deleteMany({});
        await db.collection('collectionUpdates').deleteMany({});
        await connection.close();
    });

    it('correctly retreives all categories from the database', async () => {
        // mockedFetch.mockReturnValue(Promise.resolve(new Response({ "test": 100 })));
        // load category entries into database
        const mockCategories = generateMockCategories(expectedLength);
        await db.collection("categories").insertMany(mockCategories);
        // set expire time for categories
        const inserted = await db.collection("collectionsUpdates").findOne({ name: "categories" });
        // console.log('inserted update token:', inserted);
        const categories = await loadCategories(mock_access_token, db);
        // the retreived categories should always include 50 elements, the number of categories maintained by Spotify
        expect(categories.length).toEqual(expectedLength);
    });


});

describe("Categories collection revalidation", () => {

    const mock_access_token = "mock-access-token";

    let connection: { db: (arg0: any) => Db | PromiseLike<Db>; close: () => any; };

    let db: Db;
    const mockCategory = {
        "href": "https://api.spotify.com/v1/browse/categories/pop",
        "icons": [{
            "height": { "$numberInt": "274" },
            "url": "https://t.scdn.co/media/derived/pop-274x274_447148649685019f5e2a03a39e78ba52_0_0_274_274.jpg",
            "width": { "$numberInt": "274" }
        }],
        "id": "pop",
        "name": "Pop"
    }

    beforeAll(async () => {
        let promise = await MongoClient.connect(endpoints.MongoURI).then((client) => {
            return {
                client,
                db: client.db(endpoints.MockMongoDB),
            }
        });
        connection = promise.client;
        db = promise.db;
    });

    beforeEach(async () => {
        const lastUpdates = {
            name: "categories",
            last_updated: 10 // low number to simulate expiration
        };
        const insertRes = await db.collection('collectionsUpdates').insertOne(lastUpdates);
    })

    afterEach(async () => {
        await db.collection('categories').deleteMany({});
        await db.collection('collectionsUpdates').deleteMany({});
    });

    afterAll(async () => {
        // pruge collections and close db connection
        await db.collection('categories').deleteMany({});
        await db.collection('collectionUpdates').deleteMany({});
        await connection.close();
    });

    it("correctly updates categories last_updated timestamp after one hour", async () => {
        mockedFetch.mockReturnValue(Promise.resolve(new Response(JSON.stringify({
            categories: {
                items: [mockCategory]
            }
        }))));
        const lastUpdates = {
            name: "categories",
            last_updated: 10 // low number to simulate expiration
        };
        const mockOldCategory = {
            "href": "https://api.spotify.com/v1/browse/categories/toplists",
            "icons": [{
                "height": { "$numberInt": "275" },
                "url": "https://t.scdn.co/media/derived/toplists_11160599e6a04ac5d6f2757f5511778f_0_0_275_275.jpg",
                "width": { "$numberInt": "275" }
            }],
            "id": "toplists",
            "name": "Top Lists"
        }
        await db.collection('categories').insertOne(mockOldCategory);
        // load categories to trigger revalidatation
        const results = await loadCategories(mock_access_token, db);
        const categoriesUpdates = await db.collection('collectionsUpdates').findOne({ name: "categories" });
        const last_updated = await categoriesUpdates.last_updated;

        expect(last_updated).toBeGreaterThanOrEqual(Date.now() - 4000); // four seconds to account for db query delay
        expect(last_updated).toBeLessThan(Date.now() + 3000);
        expect(results).toEqual([{ ...mockCategory, "_id": expect.anything() }]);
    });

    it('correctly catches Spotify Web API fetch error on revalidation', async () => {
        // mock fetch call
        const mockSpotifyError = {
            "error": {
                "status": 401,
                "message": "invalid access token",
            }
        };
        mockedFetch.mockReturnValue(Promise.resolve(new Response(JSON.stringify(mockSpotifyError), { status: 401 })));
        // add mock last_updated value for categories to trigger revalidation
        const result = await loadCategories(mock_access_token, db);
        expect(result).toEqual(mockSpotifyError);
    });

});