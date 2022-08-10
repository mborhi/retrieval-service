import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    console.log('request made to genres endpoint');
    res.send('hello from genres endpoint');
});

router.get('/:genre_id', (req, res) => {
    res.send('hello from the genre id endpoint');
});

export default router;