import { Db, MongoClient } from "mongodb";
import { connectToDatabase, queryDatabase } from "../src/utils/database/database";
import endpoints from "../endpoints.config";

describe('Query Database', () => {
    let connection: { db: (arg0: any) => Db | PromiseLike<Db>; close: () => any; };
    let db: Db;
    const mockToken = {
        "access_token": "mock-access-token",
        "token_type": "Bearer",
        "expires_in": { "$numberDouble": "1.6575157180000E+12" },
        "scope": "streaming user-read-email user-read-private",
        "refresh_token": "mock-refresh-token"
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

        // db = await connection.db(endpoints.MockMongoDB);
    });

    beforeEach(async () => {
        await db.collection('tokens').deleteMany({});
    })

    afterAll(async () => {
        await connection.close();
    });

    it('correctly returns a the specified token', async () => {
        await db.collection('tokens').insertOne(mockToken);
        const result = await queryDatabase('tokens', { "refresh_token": "mock-refresh-token" }, db);
        expect(result).toEqual(mockToken);
    });

    it('correctly returns an error when no results found', async () => {
        await db.collection('tokens').insertOne(mockToken);
        const result = await queryDatabase('tokens', { "refresh_token": "non-existent" }, db);
        expect(result).toEqual({ "error": "no results match query" });
    });
});

describe("Connect to Database", () => {

    it("correctly connects to the database in .env.local file", async () => {
        expect.assertions(1);
        const { db, client } = await connectToDatabase();
        expect(await db).toBeTruthy();
        await client.close();
    });

    // it("correctly catches an error if database env is not configured", async () => {

    //     const { db } = await connectToDatabase();

    // });

});