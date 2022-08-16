import express from 'express';
import { dataIsError } from '../utils/fetch-utils';
import { getUserPlaylistTracks, modifyPlaylistTracks } from '../utils/playlist/modify-playlist';

const router = express.Router();

// retrieiving the user's playlist
router.get('/', async (req, res) => {
    // get access token, and user id
    const access_token = req.headers.access_token as string; // validated at API gateway
    const user_id = req.headers.user_id as string; // validated at API gateway
    try {
        const userPlaylistTracks = await getUserPlaylistTracks(access_token, user_id);
        if (!dataIsError(userPlaylistTracks)) {
            res.status(200).json({
                data: userPlaylistTracks
            });
        } else {
            res.send(userPlaylistTracks); // Spotify Web API error
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: {
                status: 500,
                message: "Internal server error"
            }
        });
    }
});

router.all('/tracks', async (req, res) => {
    if (req.method !== "POST" && req.method !== "DELETE") {
        res.status(403).json({
            error: {
                status: 403,
                message: `${req.method} is not a valid request method for this endpoint`
            }
        });
        res.end();
    }
    const access_token = req.headers.access_token as string; // validated at API gateway
    const user_id = req.headers.user_id as string; // validated at API gateway
    const track_uri = req.query.track_uri as string;
    try {
        const results = await modifyPlaylistTracks(access_token, user_id, track_uri, req.method);
        if (!dataIsError(results)) {
            res.status(200).json({
                data: results
            });
        } else {
            res.send(results); // Spotify Web API error
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: {
                status: 500,
                message: "Internal server error"
            }
        });
    }
});

export default router;
