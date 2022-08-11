import express from 'express';
import { getCategoryPlaylist } from '../utils/categories-utils';

const router = express.Router();

router.get('/', (req, res) => {
    res.send('hello from categories route');
});

router.get('/:category_id', async (req, res) => {
    // token validated at API gateway
    const token = req.headers.access_token as string;
    const id = req.params.category_id;
    try {
        const categoryPlaylist = await getCategoryPlaylist(token, id);
        res.status(200).json({
            "data": categoryPlaylist
        });
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