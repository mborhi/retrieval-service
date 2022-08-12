import express from 'express';
import { loadGenres } from '../utils/genres/fetch-genres';
import { getGenreTracks } from '../utils/genres/fetch-genre-id';

const router = express.Router();

router.get('/', async (req, res) => {
    const token = req.headers.access_token as string;
    try {
        const genres = await loadGenres(token);
        res.status(200).json({ "data": genres });
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