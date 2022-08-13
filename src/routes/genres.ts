import express from 'express';
import { loadGenres } from '../utils/genres/fetch-genres';
import { getGenreTracks } from '../utils/genres/fetch-genre-id';
import { dataIsError } from '../utils/fetch-utils';
import { TrackData } from '../../interfaces';

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
                "message": "Internal server error"
            }
        });
    }
});

router.get('/:genre_id', async (req, res) => {
    const access_token = req.headers.access_token as string;
    const genre_id = req.params.genre_id;
    try {
        const genreTracks = await getGenreTracks(access_token, genre_id);
        if (dataIsError(genreTracks)) {
            res.send(genreTracks);
            res.end();
        }
        // genreTracks must be TrackData[]
        else if ((genreTracks as TrackData[]).length === 0) {
            res.status(404).json({
                "error": {
                    "status": 404,
                    "message": "The requested genre doesn't exist or has no tracks"
                }
            });
        } else
            res.status(200).json({ "data": genreTracks });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            "error": {
                "status": 500,
                "message": "Internal server error"
            }
        });
    }
});

export default router;