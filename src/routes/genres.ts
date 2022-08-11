import express from 'express';
import { getGenreTracks } from '../utils/genres/fetch-genre-id';

const router = express.Router();

router.get('/', (req, res) => {
    console.log('request made to genres endpoint');
    res.send('hello from genres endpoint');
});

router.get('/:genre_id', async (req, res) => {
    const access_token = req.headers.access_token as string;
    const genre_id = req.params.genre_id;

    try {
        const genreTracks = await getGenreTracks(access_token, genre_id);
        res.status(200).json({ "data": genreTracks });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            "error": {
                "status": 500,
                "message": "internal server error"
            }
        });
    }
});

export default router;