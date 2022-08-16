import express from 'express';
import { dataIsError } from '../utils/fetch-utils';
import { getUserPlaylistTracks } from '../utils/playlist/modify-playlist';

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

// adding a track to the user's paylist
router.put('/add', async (req, res) => {

});

// removing a track from the user's playlist
router.delete('/remove', async (req, res) => {

});

export default router;
