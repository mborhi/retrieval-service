import { getUserPlaylistTracks, addToPlaylist, removeFromPlaylist } from '../../src/utils/playlist/modify-playlist';
import fetch from 'node-fetch'
import { TrackData } from '../../interfaces';
jest.mock('node-fetch');
const { Response } = jest.requireActual('node-fetch');

const mockedFetch = fetch as any;

describe("Get playlist", () => {

    const mock_token = "mock-token";
    const mock_user_id = "mock-user-id";
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

    });

    it("correctly returns Spotify Web API error responses", async () => {

    });

    it("correctly handles errors formatting data", async () => {

    });


});

describe("Add to playlist", () => {

    it("correctly adds the given track to the playlist", async () => {

    });

    it("correctly creates a new playlist if the user doesn't have one yet", () => {

    });

    it("correctly returns Spotify Web API error responses", async () => {

    });

    it("correctly handles errors formatting data", async () => {

    });

});

describe("Remove from playlist", () => {

    it("correctly removes the specified track from the playlist", async () => {

    });

    it("correctly returns Spotify Web API error responses", async () => {

    });

    it("correctly handles errors formatting data", async () => {

    });
});