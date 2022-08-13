jest.mock('node-fetch');
import { PlaylistNameAndTracks } from '../../interfaces';
import fetch from 'node-fetch';
import { getCategoryPlaylist } from '../../src/utils/categories/fetch-category-id';
const { Response } = jest.requireActual('node-fetch');

const mockedFetch = fetch as any;

describe("Category playlist and track retrieval", () => {
    const mock_access_token = "mock-access-token";
    const mock_playlist_data: SpotifyApi.PlaylistObjectSimplified = {
        "collaborative": false,
        "description": "The soundtrack to the internet. Cover: Minions",
        "external_urls": {
            "spotify": "https://open.spotify.com/playlist/37i9dQZF1DX6OgmB2fwLGd"
        },
        "href": "https://api.spotify.com/v1/playlists/37i9dQZF1DX6OgmB2fwLGd",
        "id": "37i9dQZF1DX6OgmB2fwLGd",
        "images": [
            {
                "height": 255,
                "url": "https://i.scdn.co/image/ab67706f00000003e7330e0f5eaf201772c0c6f1",
                "width": 255
            }
        ],
        "name": "Internet People",
        "owner": {
            "display_name": "Spotify",
            "external_urls": {
                "spotify": "https://open.spotify.com/user/spotify"
            },
            "href": "https://api.spotify.com/v1/users/spotify",
            "id": "spotify",
            "type": "user",
            "uri": "spotify:user:spotify"
        },
        "public": true,
        "snapshot_id": "MTY2MDMzMjM0MiwwMDAwMDAwMGM0ODdlYTUzMTc2Y2ZhMmNkNDliNjkwMWYyMTgxMjlj",
        "tracks": {
            "href": "https://api.spotify.com/v1/playlists/37i9dQZF1DX6OgmB2fwLGd/tracks",
            "total": 89
        },
        "type": "playlist",
        "uri": "spotify:playlist:37i9dQZF1DX6OgmB2fwLGd"
    }

    const mock_playlist_track: SpotifyApi.PlaylistTrackObject = {
        "added_at": "2022-07-12T19:16:39Z",
        "added_by": {
            "external_urls": {
                "spotify": "https://open.spotify.com/user/"
            },
            "href": "https://api.spotify.com/v1/users/",
            "id": "",
            "type": "user",
            "uri": "spotify:user:"
        },
        "is_local": false,
        "track": {
            "album": {
                "album_type": "single",
                "artists": [
                    {
                        "external_urls": {
                            "spotify": "https://open.spotify.com/artist/4KatuTqriDODW9YiAIZD3T"
                        },
                        "href": "https://api.spotify.com/v1/artists/4KatuTqriDODW9YiAIZD3T",
                        "id": "4KatuTqriDODW9YiAIZD3T",
                        "name": "Lawsy",
                        "type": "artist",
                        "uri": "spotify:artist:4KatuTqriDODW9YiAIZD3T"
                    }
                ],
                "external_urls": {
                    "spotify": "https://open.spotify.com/album/4wSF1oy5QmEopBZ2KZxIy1"
                },
                "href": "https://api.spotify.com/v1/albums/4wSF1oy5QmEopBZ2KZxIy1",
                "id": "4wSF1oy5QmEopBZ2KZxIy1",
                "images": [
                    {
                        "height": 640,
                        "url": "https://i.scdn.co/image/ab67616d0000b27335e462379f6e96957ec3a045",
                        "width": 640
                    },
                    {
                        "height": 300,
                        "url": "https://i.scdn.co/image/ab67616d00001e0235e462379f6e96957ec3a045",
                        "width": 300
                    },
                    {
                        "height": 64,
                        "url": "https://i.scdn.co/image/ab67616d0000485135e462379f6e96957ec3a045",
                        "width": 64
                    }
                ],
                "name": "Hotel",
                "release_date": "2022-05-27",
                "release_date_precision": "day",
                "total_tracks": 1,
                "type": "album",
                "uri": "spotify:album:4wSF1oy5QmEopBZ2KZxIy1"
            },
            "artists": [
                {
                    "external_urls": {
                        "spotify": "https://open.spotify.com/artist/4KatuTqriDODW9YiAIZD3T"
                    },
                    "href": "https://api.spotify.com/v1/artists/4KatuTqriDODW9YiAIZD3T",
                    "id": "4KatuTqriDODW9YiAIZD3T",
                    "name": "Lawsy",
                    "type": "artist",
                    "uri": "spotify:artist:4KatuTqriDODW9YiAIZD3T"
                }
            ],
            "disc_number": 1,
            "duration_ms": 155350,
            "explicit": true,
            "external_ids": {
                "isrc": "USLD91739046"
            },
            "external_urls": {
                "spotify": "https://open.spotify.com/track/1rfsEU57ofvxhII8Xs57WF"
            },
            "href": "https://api.spotify.com/v1/tracks/1rfsEU57ofvxhII8Xs57WF",
            "id": "1rfsEU57ofvxhII8Xs57WF",
            "is_local": false,
            "is_playable": true,
            "name": "Hotel",
            "popularity": 72,
            "preview_url": "https://p.scdn.co/mp3-preview/911fa0c21265041757dab915e53b4c7d349890b4?cid=774b29d4f13844c495f206cafdad9c86",
            "track_number": 1,
            "type": "track",
            "uri": "spotify:track:1rfsEU57ofvxhII8Xs57WF"
        }
    }


    const expected: PlaylistNameAndTracks[] = [
        {
            "playlistName": "Internet People",
            "playlistTracks": [
                {
                    "name": "Hotel",
                    "previewURL": "https://p.scdn.co/mp3-preview/911fa0c21265041757dab915e53b4c7d349890b4?cid=774b29d4f13844c495f206cafdad9c86",
                    "trackAlbumImage": "https://i.scdn.co/image/ab67616d0000b27335e462379f6e96957ec3a045",
                    "trackNum": 1,
                    "trackURI": "spotify:track:1rfsEU57ofvxhII8Xs57WF"
                }
            ]
        }
    ]

    it("correctly formats data received from the Spotify Web API", async () => {
        mockedFetch.mockReturnValueOnce(Promise.resolve(new Response(
            JSON.stringify({
                "playlists": {
                    "items": [mock_playlist_data]
                }
            }),
        )));
        mockedFetch.mockReturnValueOnce(Promise.resolve(new Response(
            JSON.stringify({
                "tracks": {
                    "items": [mock_playlist_track]
                }
            }),
        )));

        const results = await getCategoryPlaylist(mock_access_token, "hiphop");
        expect(results).toEqual(expected);
    });


    it("correctly catches and returns if category playlist fetch fails", async () => {
        const mock_fetch_error = {
            "error": {
                "status": 401,
                "message": "Invalid access token"
            }
        }
        mockedFetch.mockReturnValue(Promise.resolve(new Response(JSON.stringify(mock_fetch_error), { "status": 401 })));
        const results = await getCategoryPlaylist(mock_access_token, "hiphop");
        expect(results).toEqual(mock_fetch_error);
    });
});