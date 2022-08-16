import fetch from 'node-fetch';
import { stringify } from 'querystring';
import { TrackData } from '../../../interfaces/index';
import { responseIsError } from '../fetch-utils';

const baseURL = process.env.SPOTIFY_BASE_URL;

/**
 * Gets the TrackData for every track in the given playlist's tracks.
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
export const getPlayListTracks = async (token: string, playlist: SpotifyApi.PlaylistObjectSimplified, fields = 'tracks', market = 'US'): Promise<TrackData[] | SpotifyApi.ErrorObject> => {
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
        // for every track in tracks, get the name of the track and the preview url
        const listOfPlaylistTracks = playlistTracks.map((playlistTrack) => {
            // add a function to handle filtering of nulls in this
            const trackData = {
                name: playlistTrack.track.name,
                previewURL: playlistTrack.track.preview_url,
                trackURI: playlistTrack.track.uri,
                trackNum: playlistTrack.track.track_number,
                trackAlbumImage: playlistTrack.track.album.images[0].url
            };
            return trackData;
        });
        return listOfPlaylistTracks;
    } catch (error) {
        console.error("Error: ", error);
        throw error;
    }
}
