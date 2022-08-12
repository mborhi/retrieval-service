import { stringify } from 'querystring';
import { TrackData } from "../../../interfaces";
import endpointsConfig from "../../../endpoints.config";


const baseURL = endpointsConfig.SpotifyAPIBaseURL;

/**
 * Generates a list of tracks from the given genre
 * @param {string} token    the OAuth2 access token
 * @param {string} genre    the Spoitfy genre seed track items to search for
 * @returns {TrackData[]}   a list of song names and preview_urls of the given genre
 */
export const getGenreTracks = async (token: string, genre: string): Promise<TrackData[]> => {
    const genreItems = await searchGenre(token, genre);
    if (genreItems.length === 0) {
        return [];
    }
    const genreTracks = genreItems.map((item: SpotifyApi.TrackObjectFull) => {
        // validated these
        return {
            name: item.name,
            previewURL: item.preview_url,
            trackURI: item.uri,
            trackNum: item.track_number,
            trackAlbumImage: item.album.images[0].url
        };
    });
    return genreTracks;
}

/**
 * Returns a list of tracks from the specified genre
 * Uses Search Spotify Web API Call:
 * 
 * API Reference	https://developer.spotify.com/documentation/web-api/reference/#/operations/search
 * 
 * Endpoint	        https://api.spotify.com/v1/search
 * 
 * HTTP Method	    GET
 * 
 * OAuth	        Required
 * @param {string} token    the OAuth access token 
 * @param {string} genre    the spotify category to search for
 * @param {number} limit    the number of results to include in return (defualt = 50)
 * @returns {SpotifyApi.TrackObjectFull[]}       a list of tracks from the specified genre
 */
const searchGenre = async (token: string, genre: string, limit: number = 50): Promise<SpotifyApi.TrackObjectFull[]> => {
    const query = {
        q: 'genre:' + genre,
        type: 'track',
        market: 'US',
        offset: 0,
        limit: limit
    };
    let url = baseURL + '/search?' + stringify(query);
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        }
    });
    try {
        const data: SpotifyApi.TrackSearchResponse = await response.json();
        return data.tracks.items;
        // return items;
    } catch (error) {
        throw error;
    }
}