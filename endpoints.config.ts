import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

export default {
    ServerURL: process.env.SERVER_URL ?? '',
    ServerPort: process.env.SERVER_PORT ?? 3000,
    SpotifyAPIBaseURL: process.env.SPOTIFY_BASE_URL ?? 'https://api.spotify.com/v1',
    MongoURI: process.env.MONGODB_URI ?? '',
    MongoDB: process.env.MONGODB_DB ?? '',
    MockMongoDB: process.env.MOCK_MONGODB_DB ?? '',
}