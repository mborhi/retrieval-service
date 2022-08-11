const { MongoClient } = require('mongodb');
import { Db, MongoClient as Client } from "mongodb";
import { loadGenres } from "../../src/utils/genres/fetch-genres";

describe("Fetch genres from database or make Spotify API call", () => {

    const mock_token = "mock_access_token";

    let connection: { db: (arg0: any) => Db | PromiseLike<Db>; close: () => any; };
    let db: Db;
    const expectedLength = 126;

    const unmockedFetch = global.fetch;

    const generateMockGenres = (length: number) => {
        const mocks = [...Array(length).fill(1)].map((e, idx) => {
            return {
                "name": "mock_genres" + idx
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

    /**
     * This requires that entries be loaded into the mock database
     */
    it("correctly retreives all genres from the database", async () => {
        const mockGenres = generateMockGenres(expectedLength);
        await db.collection('genres').insertMany(mockGenres);
        await db.collection('collectionsUpdates').insertOne({ "name": "genres", "last_updated": Date.now() });
        const genres = await loadGenres(mock_token, db);
        // the retreived genres should always have a length of 126, the number of genres maintained by Spotify 
        expect(genres.length).toEqual(126);
    });
});

describe("Genre collection revalidation", () => {
    const mock_token = "mock_access_token";

    let connection: { db: (arg0: any) => Db | PromiseLike<Db>; close: () => any; };
    let db: Db;

    const unmockedFetch = global.fetch

    beforeAll(() => {
        // mock fetch
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ genres: ['mockGenre'] }),
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
        await db.collection('genres').deleteMany({});
        await db.collection('collectionsUpdates').deleteMany({});
    })

    afterAll(() => {
        // restore fetch
        global.fetch = unmockedFetch
        jest.restoreAllMocks();
    });

    afterAll(async () => {
        // close db connection
        await connection.close();
    });

    it("correctly updates genres last_updated timestamp after one hour", async () => {
        const lastUpdates = {
            name: "genres",
            last_updated: 10
        };
        const mockGenre = {
            id: "acoustic",
            name: "acoustic",
        };
        await db.collection('genres').insertOne(mockGenre);
        await db.collection('collectionsUpdates').insertOne(lastUpdates);
        // load genres to trigger revalidatation
        await loadGenres(mock_token, db);
        const genresUpdate = await db.collection('collectionsUpdates').findOne({ name: "genres" });
        const last_updated = await genresUpdate.last_updated;

        expect(last_updated).toBeGreaterThanOrEqual(Date.now() - 2000);
        expect(last_updated).toBeLessThan(Date.now() + 2000);
    });

    it("correctly refreshes genres after one hour", async () => {
        const lastUpdates = {
            name: "genres",
            last_updated: 10 // low number to simulate expiration
        };
        // this is the only document that is in genres collections before re-validation
        const mockOldCategory = {
            id: "acoustic",
            name: "acoustic",
        }
        await db.collection('genres').insertOne(mockOldCategory);
        await db.collection('collectionsUpdates').insertOne(lastUpdates);
        // load genres to update collection
        await loadGenres(mock_token, db);
        const genres = await db.collection('genres').find({}).toArray();
        expect(await genres[0].id).toEqual("mockGenre");
        expect(await genres[0].name).toEqual("mockGenre");
    });
});
