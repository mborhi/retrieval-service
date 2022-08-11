/// <reference path="./node_modules/@types/spotify-api/index.d.ts" />

declare global {
    var mongo: Mongo;
    var __MONGO_URI__: string;
    var __MONGO_DB_NAME__: string;
}

export { };