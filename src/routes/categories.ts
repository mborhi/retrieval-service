import express from 'express';
import { dataIsError } from '../utils/fetch-utils';
import { loadCategories } from '../utils/categories/fetch-categories';
import { getCategoryPlaylist } from '../utils/categories/fetch-category-id';

const router = express.Router();

router.get('/', async (req, res) => {
    const token = req.headers.access_token as string;
    try {
        const categories = await loadCategories(token);
        if (dataIsError(categories)) {
            res.send(categories);
        } else
            res.status(200).json({ "data": categories });
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

router.get('/:category_id', async (req, res) => {
    // token validated at API gateway
    const token = req.headers.access_token as string;
    const id = req.params.category_id;
    try {
        const categoryPlaylist = await getCategoryPlaylist(token, id);
        if (dataIsError(categoryPlaylist)) {
            res.send(categoryPlaylist);
        } else if (categoryPlaylist.length === 0) {
            res.send({
                "error": {
                    "status": 501,
                    "message": "Error retrieving requested category data"
                }
            });
        } else
            res.status(200).json({
                "data": categoryPlaylist
            });
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