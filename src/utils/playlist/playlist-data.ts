import endpointsConfig from '../../../endpoints.config';
import fetch from 'node-fetch';
import { stringify } from 'querystring';
import { TrackData } from '../../../interfaces/index';
import { dataIsError, responseIsError } from '../fetch-utils';
import { createNewPlaylist } from './modify-playlist';

const baseURL = process.env.SPOTIFY_BASE_URL;


/**
 * Gets the tracks of the specified playlist
 * Uses Get Playlist Spotify Web API call:
 * 
 * API Reference	https://developer.spotify.com/documentation/web-api/reference/#/operations/get-playlist
 * 
 * Endpoint	        https://api.spotify.com/v1/playlists/{playlist_id}
 * 
 * HTTP Method	    GET
 * 
 * OAuth	        Required
 * @param {string} token                the user's OAuth2 token
 * @param {SpotifyApi.PlaylistObjectSimplified} playlist   the playlist to get the tracks of
 * @param {string} [fields='tracks']    the type to return
 * @param {string} [market='US']        the market to return tracks from
 * @returns {TrackData[]}               an array of the playlists' tracks data (name, previewURL)
 * @throws Will throw an error if playlists and tracks cannot be retrieved correctly.
 */
export const getPlayListTracks = async (token: string, playlist: SpotifyApi.PlaylistObjectSimplified, fields = 'tracks', market = 'US'): Promise<SpotifyApi.PlaylistTrackObject[] | SpotifyApi.ErrorObject> => {
    const query = {
        fields: fields,
        market: market
    }
    const url = baseURL + '/playlists/' + playlist.id + '?' + stringify(query);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    });
    if (responseIsError(response)) return await response.json();
    try {
        const data: SpotifyApi.SinglePlaylistResponse = await response.json();
        const playlistTracks = data.tracks.items; // list of spotify_tracks
        return playlistTracks;
    } catch (error) {
        console.error("Error: ", error);
        throw error;
    }
}


/**
 * Returns the track data of the given tracks
 * @param tracks the tracks to format
 * @returns the TrackData of the given tracks
 */
const formatListOfTracks = (tracks: SpotifyApi.PlaylistTrackObject[]): TrackData[] => {
    const listOfPlaylistTracks = tracks.map((track) => {
        // add a function to handle filtering of nulls in this
        try {
            const trackData = {
                name: track.track.name,
                previewURL: track.track.preview_url,
                trackURI: track.track.uri,
                trackNum: track.track.track_number,
                trackAlbumImage: track.track.album.images[0].url
            };
            return trackData;
        } catch (error) {
            console.error(error);
            return {
                name: '',
                previewURL: '',
                trackURI: '',
                trackNum: 0,
                trackAlbumImage: ''
            }
        }
    });
    return listOfPlaylistTracks;
}

/**
 * Returns the TrackData[] for the specified playlist
 * @param {string} token                the user's OAuth2 token
 * @param {SpotifyApi.PlaylistObjectSimplified} playlist   the playlist to get the tracks of
 * @param {string} [fields='tracks']    the type to return
 * @param {string} [market='US']        the market to return tracks from
 * @returns {TrackData[]}               an array of the playlists' tracks data (name, previewURL)
 * @returns 
 */
export const getFormattedListOfTracks = async (token: string, playlist: SpotifyApi.PlaylistObjectSimplified, fields = 'tracks', market = 'US'): Promise<TrackData[] | SpotifyApi.ErrorObject> => {
    const tracks = await getPlayListTracks(token, playlist, fields, market);
    if (dataIsError(tracks)) return tracks;
    const formatted = formatListOfTracks(tracks as SpotifyApi.PlaylistTrackObject[]);
    return formatted;
}

/**
 * Returns the tracks which aren't in the given playlistTracks list
 * @param tracksToFilter the tracks to be filtered for
 * @param playlistTracks the list of tracks to filter in
 * @returns the tracks which aren't present in the playlistTracks
 */
export const filterTracksToAdd = (tracksToFilter: string | string[], playlistTracks: SpotifyApi.PlaylistTrackObject[]): string => {
    let tracks = tracksToFilter.toString().split(',');
    let tracksToAdd: string[] = [];
    tracks.forEach((track) => {
        let match = false;
        playlistTracks.forEach((playlistTrack) => {
            if (playlistTrack.track.uri === track) match = true;
        });
        if (!match) tracksToAdd.push(track.trim());
    });
    return tracksToAdd.join(',');
}

/**
 * Finds the quick discover playlist of the user, creates a new one if it doesn't exist
 * @param token the OAuth2 access token of the user
 * @param user_id the user's id
 * @param playlists the user's playlists
 * @returns the quick discover playlist
 */
export const findOrCreatePlaylist = async (token: string, user_id: string, playlists: SpotifyApi.PlaylistObjectSimplified[]) => {
    const quickDiscoverPlaylist = playlists.find((playlist) => playlist.name === endpointsConfig.QuickDiscoverPlaylistName) || await createNewPlaylist(token, user_id);
    return quickDiscoverPlaylist;
}