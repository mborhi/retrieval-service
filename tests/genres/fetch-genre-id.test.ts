import { getGenreTracks } from "../../src/utils/genres/fetch-genre-id";
import fetch from 'node-fetch'
jest.mock('node-fetch');
const { Response } = jest.requireActual('node-fetch');

const mockedFetch = fetch as any;

describe("Genre track retrieval", () => {

    const mock_token = "mock-access-token";

    const mock_search_response: SpotifyApi.TrackSearchResponse = {
        "tracks": {
            "href": "https://api.spotify.com/v1/search?query=genre%3Aanime&type=track&market=US&locale=en-US%2Cen%3Bq%3D0.9&offset=0&limit=1",
            "items": [
                {
                    "album": {
                        "album_type": "album",
                        "artists": [
                            {
                                "external_urls": {
                                    "spotify": "https://open.spotify.com/artist/58oPVy7oihAEXE0Ott6JOf"
                                },
                                "href": "https://api.spotify.com/v1/artists/58oPVy7oihAEXE0Ott6JOf",
                                "id": "58oPVy7oihAEXE0Ott6JOf",
                                "name": "Eve",
                                "type": "artist",
                                "uri": "spotify:artist:58oPVy7oihAEXE0Ott6JOf"
                            }
                        ],
                        "external_urls": {
                            "spotify": "https://open.spotify.com/album/6BZjN6j79mjz7PJfGmvCR1"
                        },
                        "href": "https://api.spotify.com/v1/albums/6BZjN6j79mjz7PJfGmvCR1",
                        "id": "6BZjN6j79mjz7PJfGmvCR1",
                        "images": [
                            {
                                "height": 640,
                                "url": "https://i.scdn.co/image/ab67616d0000b2734b54d2a72484832db80a0fe9",
                                "width": 640
                            },
                            {
                                "height": 300,
                                "url": "https://i.scdn.co/image/ab67616d00001e024b54d2a72484832db80a0fe9",
                                "width": 300
                            },
                            {
                                "height": 64,
                                "url": "https://i.scdn.co/image/ab67616d000048514b54d2a72484832db80a0fe9",
                                "width": 64
                            }
                        ],
                        "name": "Kaikai Kitan / Ao No Waltz",
                        "release_date": "2020-12-23",
                        "release_date_precision": "day",
                        "total_tracks": 7,
                        "type": "album",
                        "uri": "spotify:album:6BZjN6j79mjz7PJfGmvCR1"
                    },
                    "artists": [
                        {
                            "external_urls": {
                                "spotify": "https://open.spotify.com/artist/58oPVy7oihAEXE0Ott6JOf"
                            },
                            "href": "https://api.spotify.com/v1/artists/58oPVy7oihAEXE0Ott6JOf",
                            "id": "58oPVy7oihAEXE0Ott6JOf",
                            "name": "Eve",
                            "type": "artist",
                            "uri": "spotify:artist:58oPVy7oihAEXE0Ott6JOf"
                        }
                    ],
                    "disc_number": 1,
                    "duration_ms": 221426,
                    "explicit": false,
                    "external_ids": {
                        "isrc": "JPTF02017001"
                    },
                    "external_urls": {
                        "spotify": "https://open.spotify.com/track/6y4GYuZszeXNOXuBFsJlos"
                    },
                    "href": "https://api.spotify.com/v1/tracks/6y4GYuZszeXNOXuBFsJlos",
                    "id": "6y4GYuZszeXNOXuBFsJlos",
                    "is_local": false,
                    "is_playable": true,
                    "name": "Kaikai Kitan",
                    "popularity": 74,
                    "preview_url": "https://p.scdn.co/mp3-preview/873eae9501339949141b75414aacbcf874afe4d4?cid=774b29d4f13844c495f206cafdad9c86",
                    "track_number": 1,
                    "type": "track",
                    "uri": "spotify:track:6y4GYuZszeXNOXuBFsJlos"
                }
            ],
            "limit": 1,
            "next": "https://api.spotify.com/v1/search?query=genre%3Aanime&type=track&market=US&locale=en-US%2Cen%3Bq%3D0.9&offset=1&limit=1",
            "offset": 0,
            "previous": null,
            "total": 10000
        }
    }


    it("correctly formats fetched gene tracks", async () => {
        mockedFetch.mockReturnValue(Promise.resolve(new Response(
            JSON.stringify(mock_search_response), { status: 200 }
        )));

        const expected = [
            {
                "name": "Kaikai Kitan",
                "previewURL": "https://p.scdn.co/mp3-preview/873eae9501339949141b75414aacbcf874afe4d4?cid=774b29d4f13844c495f206cafdad9c86",
                "trackURI": "spotify:track:6y4GYuZszeXNOXuBFsJlos",
                "trackNum": 1,
                "trackAlbumImage": "https://i.scdn.co/image/ab67616d0000b2734b54d2a72484832db80a0fe9"
            },
        ]

        const genreTracks = await getGenreTracks(mock_token, "anime");

        expect(genreTracks).toEqual(expected);
    });

    it("correctly handles Spotify Web API error", async () => {
        const expectedError = { "error": { "status": 401, "message": "invalid token" } };
        mockedFetch.mockReturnValue(Promise.resolve(new Response(
            JSON.stringify(expectedError), { "status": 401 }
        )));

        const result = await getGenreTracks(mock_token, "abc");

        expect(result).toEqual(expectedError);
    });

    it("correctly catches an error if Spotify Web API response can't be formatted", async () => {
        mockedFetch.mockReturnValue(Promise.resolve(new Response(
            JSON.stringify({}), { "status": 200 }
        )));

        await expect(getGenreTracks(mock_token, "abc")).rejects.toThrow(TypeError);
    })
});