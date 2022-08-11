import fetch from 'node-fetch';
import { stringify } from 'querystring';
import { TrackData, PlaylistNameAndTracks } from '../../../interfaces/index';

const baseURL = process.env.SPOTIFY_BASE_URL;

/**
 * Gets a list of the specified number of given category's playlists' tracks.
 * Uses Get Category's Playlist Spotify Web API call:
 * 
 * API reference    https://developer.spotify.com/documentation/web-api/reference/#/operations/get-a-categories-playlists
 * 
 * Endpoint	        https://api.spotify.com/v1/browse/categories/{category_id}/playlists
 * 
 * HTTP Method	    GET
 * 
 * OAuth	        Required
 * @param {string} token                the users OAuth2 token
 * @param {string} categoryID           the spotify category_id
 * @param {string} [country='US']       the spotify country code
 * @param {number} [limit=2]            the number of results to return from API query
 * @param {number} [offset=0]           the offset of results
 * @returns {PlaylistNameAndTracks[]}   a list of PlaylistNameAndTracks
 * @throws Will throw an error if playlists cannot be retrieved from the Spotify Web API.
 */
export const getCategoryPlaylist = async (token: string, categoryID: string, country = 'US', limit = 5, offset = 0): Promise<PlaylistNameAndTracks[]> => {
    const query = {
        country: country,
        limit: limit,
        offset: offset
    }
    const url = baseURL + `/browse/categories/${categoryID}/playlists?` + stringify(query);
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    });

    try {
        const data: SpotifyApi.CategoryPlaylistsResponse = await response.json();
        const playlists = data.playlists.items;
        const playlistsData: PlaylistNameAndTracks[] = playlists.length !== 0 ? await getPlaylistsData(token, playlists) : [];
        return playlistsData;
    } catch (error) {
        console.error("Error: ", error);
        throw error;
    }
}

/**
 * Gets PlaylistNameAndTracks for the given list of spotify_playlists.
 * @param {string} token the user's OAuth2 token
 * @param {SpotifyApi.PlaylistObjectSimplified[]} playlists playlists to get data for
 * @returns {PlaylistNameAndTracks[]} a list of PlaylistNameAndTracks
 * @throws Will throw an error if playlists cannot be retrieved from the Spotify Web API.
 */
const getPlaylistsData = async (token: string, playlists: SpotifyApi.PlaylistObjectSimplified[]): Promise<PlaylistNameAndTracks[]> => {
    const listOfPlaylistsTracks = playlists.map(async (playlist) => {
        const playlistTracks = await getPlayListTracks(token, playlist);
        return { playlistName: playlist.name, playlistTracks: playlistTracks };
    });

    const results = await Promise.all(listOfPlaylistsTracks);
    return results;
}

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
 * @throws Will throw an error if playlists cannot be retrieved from the Spotify Web API.
 */
const getPlayListTracks = async (token: string, playlist: SpotifyApi.PlaylistObjectSimplified, fields = 'tracks', market = 'US'): Promise<TrackData[]> => {
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
    try {
        const data: SpotifyApi.SinglePlaylistResponse = await response.json();
        const playlistTracks = data.tracks.items; // list of spotify_tracks
        // for every track in tracks, get the name of the track and the preview url
        const listOfPlaylistTracks = playlistTracks.map((playlistTrack) => {
            // add a function to handle this
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