import endpointsConfig from "../../../endpoints.config";
import fetch from "node-fetch";
import { stringify } from 'querystring';
import { dataIsError, responseIsError } from '../fetch-utils';
import { filterTracksToAdd, findOrCreatePlaylist, getFormattedListOfTracks, getPlayListTracks } from "./playlist-data";

const baseURL = endpointsConfig.SpotifyAPIBaseURL;

/**
 * Retrieves the tracks of the given user's quick discover playlist
 * @param token the users OAuth2 access token
 * @param user_id the id of the user
 * @param limit the maximum number of playlists to recieve
 * @param offset the offset of playlists
 */
export const getUserPlaylistTracks = async (token: string, user_id: string, limit = 50, offset = 0) => {
    const playlist = await getUsersPlaylists(token, user_id, limit, offset);
    if (dataIsError(playlist)) return playlist;
    const tracks = await getFormattedListOfTracks(token, playlist);
    return tracks;
};

/**
 * Retrieves the given user's paylists
 * Uses Get User's Playlists Spotify Web API call:
 * 
 * API Reference	https://developer.spotify.com/documentation/web-api/reference/#/operations/get-list-users-playlists
 * 
 * Endpoint	        https://api.spotify.com/v1/users/{user_id}/playlists
 * 
 * HTTP Method	    GET
 * 
 * OAuth	        Required
 * @param token the users OAuth2 access token
 * @param user_id the id of the user
 * @param limit the maximum number of playlists to recieve
 * @param offset the offset of playlists
 */
const getUsersPlaylists = async (token: string, user_id: string, limit = 50, offset = 0) => {
    const queryParams = {
        limit: limit,
        offset: offset
    }
    const url = baseURL + `/users/${user_id}/playlists?${stringify(queryParams)}`;
    const response = await fetch(url, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    });
    if (responseIsError(response)) return await response.json();
    try {
        const data: SpotifyApi.ListOfUsersPlaylistsResponse = await response.json();
        // find the playlist
        const playlists = data.items;
        const quickDiscoverPlaylist = await findOrCreatePlaylist(token, user_id, playlists);
        return quickDiscoverPlaylist;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/**
 * Adds or delets the given track from the user's playlist based on the specified method
 * Uses the Add Items to Playlist Spotify Web API call:
 * API Reference	https://developer.spotify.com/documentation/web-api/reference/#/operations/add-tracks-to-playlist
 * 
 * Endpoint	        https://api.spotify.com/v1/playlists/{playlist_id}/tracks
 * 
 * HTTP Method	    POST
 * 
 * OAuth	        Required
 * @param token the user's OAuth2 access token
 * @param user_id the id of the user
 * @param track_uri the uri of the track to add
 * @param method the HTTP method to perform the operation with
 */
export const modifyPlaylistTracks = async (token: string, user_id: string, track_uri: string, method: string) => {
    const quickDiscoverPlaylist = await getUsersPlaylists(token, user_id);
    const quickDiscoverTracks = await getPlayListTracks(token, quickDiscoverPlaylist);
    if (dataIsError(quickDiscoverTracks)) return quickDiscoverTracks;
    if (method === "POST") { // if track is to be added, filter if it already exists
        track_uri = filterTracksToAdd(track_uri, quickDiscoverTracks as SpotifyApi.PlaylistTrackObject[]);
        // if there are no new tracks to add, return error
        if (track_uri === '') return { "error": { "message": "Track already exists in playlist", "status": 423 } };
    }
    // add to playlist
    const playlist_id = await quickDiscoverPlaylist.id;
    const track_uris = {
        uris: [track_uri]
    }
    const queryParams = {
        position: 0,
    }
    const url = baseURL + `/playlists/${playlist_id}/tracks?` + (method === "POST" ? stringify(queryParams) : "");
    const response = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(track_uris)
    });
    if (responseIsError(response)) return await response.json();
    try {
        const snapshot: SpotifyApi.PlaylistSnapshotResponse = await response.json();
        return snapshot.snapshot_id;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/**
 * Creates a new private playlist with the name and description specified in the endpoints config
 * Uses Create Playlist Spotify Web API call:
 * API Reference	https://developer.spotify.com/documentation/web-api/reference/#/operations/create-playlist
 * 
 * Endpoint	        https://api.spotify.com/v1/users/{user_id}/playlists
 * 
 * HTTP Method	    POST
 * 
 * OAuth	        Required
 * @param token the user's OAuth2 access token
 * @param user_id the id of the user to create playlist for
 * @returns the newly created playlist
 */
export const createNewPlaylist = async (token: string, user_id: string): Promise<SpotifyApi.PlaylistObjectSimplified> => {
    const bodyParams = {
        "name": endpointsConfig.QuickDiscoverPlaylistName,
        "description": "Songs discovered through the Quick Discover web app",
        "public": false
    }
    const url = baseURL + `/users/${user_id}/playlists`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(bodyParams)
    });
    if (responseIsError(response)) return await response.json();
    try {
        const data: SpotifyApi.CreatePlaylistResponse = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
