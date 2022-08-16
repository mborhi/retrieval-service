import { getUserPlaylistTracks, createNewPlaylist, modifyPlaylistTracks } from '../../src/utils/playlist/modify-playlist'; // addToPlaylist, removeFromPlaylist,
import fetch from 'node-fetch'
import { TrackData } from '../../interfaces';
jest.mock('node-fetch');
const { Response } = jest.requireActual('node-fetch');

const mockedFetch = fetch as any;
const mock_token = "mock-token";
const mock_user_id = "mock-user-id";

describe("Get playlist", () => {

    const mock_track_uri = "spotify:mock:track-uri";

    it("correctly retrieves the user's playlist's tracks", async () => {
        const mock_playlist_obj: SpotifyApi.PlaylistObjectSimplified = {
            tracks: {
                href: 'https://mock',
                total: 1
            },
            collaborative: false,
            description: 'Songs discovered on the Spotify Quick Discover web app.',
            id: 'mockid',
            images: [],
            name: 'Quick Discover Finds', // add this to env
            owner: undefined,
            public: false,
            snapshot_id: '',
            type: 'playlist',
            href: '',
            external_urls: undefined,
            uri: ''
        }
        const mock_playlists_response: SpotifyApi.ListOfUsersPlaylistsResponse = {
            href: '',
            items: [mock_playlist_obj],
            limit: 0,
            next: '',
            offset: 0,
            previous: '',
            total: 0
        };
        const mock_track_response = {
            track: {
                name: 'mock-track',
                preview_url: 'mock-preview',
                uri: mock_track_uri,
                track_number: 0,
                album: {
                    images: [{ url: 'album-image' }]
                }
            }
        }
        const expectedTrackData = {
            name: "mock-track",
            previewURL: "mock-preview",
            trackURI: mock_track_uri,
            trackNum: 0,
            trackAlbumImage: "album-image"
        }

        const mock_tracks_response = { // SpotifyApi.SinglePlaylistResponse
            tracks: {
                items: [mock_track_response]
            }
        }

        mockedFetch.mockReturnValueOnce(Promise.resolve(new Response(
            JSON.stringify(mock_playlists_response), { status: 200 }
        )));
        mockedFetch.mockReturnValueOnce(Promise.resolve(new Response(
            JSON.stringify(mock_tracks_response), { status: 200 }
        )));
        const results = await getUserPlaylistTracks(mock_token, mock_user_id);
        const expected: TrackData[] = [expectedTrackData];
        expect(results).toEqual(expected);
    });

    it("correctly creates a new playlist if user doesn't have one yet", async () => {
        const mock_playlists_response: SpotifyApi.ListOfUsersPlaylistsResponse = {
            href: '',
            items: [],
            limit: 0,
            next: '',
            offset: 0,
            previous: '',
            total: 0
        }

        const mock_create_response: SpotifyApi.CreatePlaylistResponse = {
            followers: undefined,
            tracks: undefined,
            collaborative: false,
            description: '',
            id: 'mockid',
            images: [],
            name: 'Quick Discover Finds',
            owner: undefined,
            public: false,
            snapshot_id: '',
            type: 'playlist',
            href: '',
            external_urls: undefined,
            uri: ''
        }
        const mock_tracks_response: any = { // SpotifyApi.SinglePlaylistResponse
            tracks: {
                items: [],
            }
        }
        // mock get users playlist resposne
        mockedFetch.mockReturnValueOnce(Promise.resolve(new Response(
            JSON.stringify(mock_playlists_response), { status: 200 }
        )));
        // mock create new playlist response
        mockedFetch.mockReturnValueOnce(Promise.resolve(new Response(
            JSON.stringify(mock_create_response), { status: 201 }
        )));
        // mock get playlist tracks response
        mockedFetch.mockReturnValueOnce(Promise.resolve(new Response(
            JSON.stringify(mock_tracks_response), { status: 200 }
        )));

        const results = await getUserPlaylistTracks(mock_token, mock_user_id);
        expect(results).toEqual([]); // newly created playlist should have no tracks

    });

    it("correctly returns Spotify Web API error responses", async () => {
        const error_response = {
            error: {
                status: 401,
                message: "Invalid token"
            }
        };
        mockedFetch.mockReturnValue(Promise.resolve(new Response(
            JSON.stringify(error_response), { status: 401 }
        )));
        const results = await getUserPlaylistTracks(mock_token, mock_user_id);
        expect(results).toEqual(error_response);
    });


});

describe("Add/Remove from playlist", () => {

    const mock_playlist_obj: SpotifyApi.PlaylistObjectSimplified = {
        tracks: {
            href: 'https://mock',
            total: 1
        },
        collaborative: false,
        description: 'Songs discovered on the Spotify Quick Discover web app.',
        id: 'mockid',
        images: [],
        name: 'Quick Discover Finds', // add this to env
        owner: undefined,
        public: false,
        snapshot_id: '',
        type: 'playlist',
        href: '',
        external_urls: undefined,
        uri: ''
    }
    const mock_playlists_response: SpotifyApi.ListOfUsersPlaylistsResponse = {
        href: '',
        items: [mock_playlist_obj],
        limit: 0,
        next: '',
        offset: 0,
        previous: '',
        total: 0
    };

    it("correctly returns a snapshot id if operation is successful", async () => {
        const snapshot: SpotifyApi.PlaylistSnapshotResponse = {
            snapshot_id: 'mock-snapshot'
        }
        mockedFetch.mockReturnValueOnce(Promise.resolve(new Response(
            JSON.stringify(mock_playlists_response), { status: 200 }
        )));
        mockedFetch.mockReturnValueOnce(Promise.resolve(new Response(
            JSON.stringify(snapshot), { status: 201 }
        )));
        const result = await modifyPlaylistTracks(mock_token, mock_user_id, "mock-uri", "add");
        expect(result).toEqual('mock-snapshot');
    });

    it("correctly returns Spotify Web API error responses", async () => {
        const mock_error = {
            error: {
                status: 401,
                message: "Invalid token"
            }
        };
        mockedFetch.mockReturnValueOnce(Promise.resolve(new Response(
            JSON.stringify(mock_playlists_response), { status: 200 }
        )));
        mockedFetch.mockReturnValueOnce(Promise.resolve(new Response(
            JSON.stringify(mock_error), { status: 401 }
        )));
        const result = await modifyPlaylistTracks(mock_token, mock_user_id, "mock-uri", "add");
        expect(result).toEqual(mock_error);
    });

});

describe("Create playlist", () => {

    it("correctly creates a new playlist with valid values", async () => {

        const mock_create_response: SpotifyApi.CreatePlaylistResponse = {
            followers: undefined,
            tracks: undefined,
            collaborative: false,
            description: '',
            id: 'mockid',
            images: [],
            name: 'Quick Discover Finds',
            owner: undefined,
            public: false,
            snapshot_id: '',
            type: 'playlist',
            href: '',
            external_urls: undefined,
            uri: ''
        }

        mockedFetch.mockReturnValue(Promise.resolve(new Response(
            JSON.stringify(mock_create_response), { status: 201 }
        )));

        const results = await createNewPlaylist(mock_token, mock_user_id);
        expect(results).toEqual(mock_create_response);

    });

    it("correctly returns a Spotify Error Object response", async () => {
        const mock_error = { error: { status: 401, message: "Invalid token" } }
        mockedFetch.mockReturnValue(Promise.resolve(new Response(
            JSON.stringify(mock_error), { status: 401 }
        )));
        const results = await createNewPlaylist(mock_token, mock_user_id);
        expect(results).toEqual(mock_error);
    });

});