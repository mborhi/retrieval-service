import endpointsConfig from "../../../endpoints.config";
import fetch from "node-fetch";
import { stringify } from 'querystring';
import { dataIsError, responseIsError } from '../fetch-utils';
import { findOrCreatePlaylist, getPlayListTracks } from "./playlist-data";

const baseURL = endpointsConfig.SpotifyAPIBaseURL;

/**
 * Retrieves the tracks of the given user's playlist
 * @param token the users OAuth2 access token
 * @param user_id the id of the user
 * @param limit the maximum number of playlists to recieve
 * @param offset the offset of playlists
 */
export const getUserPlaylistTracks = async (token: string, user_id: string, limit = 50, offset = 0) => {
    const playlist = await getUsersPlaylist(token, user_id, limit, offset);
    if (dataIsError(playlist)) return playlist;
    const tracks = await getPlayListTracks(token, playlist);
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
const getUsersPlaylist = async (token: string, user_id: string, limit = 50, offset = 0) => {
    const queryParams = {
        limit: limit,
        offset: offset
    }
    const url = baseURL + `users/${user_id}/playlists?` + stringify(queryParams);
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
 * Adds the given track to the user's playlist
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
 */
export const addToPlaylist = async (token: string, user_id: string, track_uri: string) => {
    // const quickDiscoverPlaylist = await findOrCreatePlaylist(token, user_id,);
};

export const removeFromPlaylist = async (token: string) => {

};

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

