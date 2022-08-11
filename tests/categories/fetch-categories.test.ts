import { Db, MongoClient as Client } from 'mongodb';
import { loadCategories } from '../../src/utils/categories/fetch-categories';
const { MongoClient } = require('mongodb');

describe("Fetch categories from database or make Spotify API call", () => {
    const mock_access_token = "mock-access-token";

    let connection: { db: (arg0: any) => Db | PromiseLike<Db>; close: () => any; };
    let db: Db;
    const expectedLength = 50;

    const unmockedFetch = global.fetch;

    const generateMockCategories = (length: number) => {
        const mocks = [...Array(length).fill(1)].map((e, idx) => {
            return {
                "name": "mock_category" + idx
            }
        });
        return mocks
    }

    beforeAll(() => {
        // mock fetch
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ test: 100 }),
            }),
        ) as jest.Mock;
    });

    beforeAll(async () => {
        connection = await MongoClient.connect(globalThis.__MONGO_URI__, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        db = await connection.db(globalThis.__MONGO_DB_NAME__);

    });

    afterAll(() => {
        // restore fetch
        global.fetch = unmockedFetch
        jest.restoreAllMocks();
    });

    afterAll(async () => {
        await connection.close();
    });

    it('correctly retreives all categories from the database', async () => {
        // load category entries into database
        const mockCategories = generateMockCategories(expectedLength);
        await db.collection("categories").insertMany(mockCategories);
        // set expire time for categories
        await db.collection("collectionsUpdates").insertOne({ name: "categories", last_updated: Date.now() });
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

    const unmockedFetch = global.fetch;

    beforeAll(() => {
        // mock fetch
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({
                    categories: { items: [mockCategory] }
                }),
            }),
        ) as jest.Mock;
    });

    beforeAll(async () => {
        connection = await MongoClient.connect(globalThis.__MONGO_URI__, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        db = await connection.db(globalThis.__MONGO_DB_NAME__);
    });

    afterEach(async () => {
        await db.collection('categories').deleteMany({});
        await db.collection('collectionsUpdates').deleteMany({});
    });

    afterAll(() => {
        // restore fetch
        global.fetch = unmockedFetch
        jest.restoreAllMocks();
    });

    afterAll(async () => {
        // close db connection
        await connection.close();
    });

    it("correctly updates categories last_updated timestamp after one hour", async () => {
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
        await db.collection('collectionsUpdates').insertOne(lastUpdates);
        // load categories to trigger revalidatation
        await loadCategories(mock_access_token, db);
        const categoriesUpdates = await db.collection('collectionsUpdates').findOne({ name: "categories" });
        const last_updated = await categoriesUpdates.last_updated;

        expect(last_updated).toBeGreaterThanOrEqual(Date.now() - 500);
        expect(last_updated).toBeLessThan(Date.now() + 500);
    });

    it("correctly refreshes catogories after one hour", async () => {
        const lastUpdates = {
            name: "categories",
            last_updated: 10 // low number to simulate expiration
        };
        // this is the only document in the categories collection before revalidation
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
        await db.collection('collectionsUpdates').insertOne(lastUpdates);
        // load categories to update collection
        await loadCategories(mock_access_token, db);
        const categories = await db.collection('categories').find({}).toArray();
        expect(categories).toEqual([mockCategory]);
    });

});