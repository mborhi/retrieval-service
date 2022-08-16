import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import express from 'express';
import categoriesRouter from './routes/categories';
import genresRouter from './routes/genres';
import playlistRouter from './routes/playlist'

const app = express();
const PORT = process.env.SERVER_PORT || 3000;

app.use('/categories', categoriesRouter);
app.use('/genres', genresRouter);
app.use('/playlist', playlistRouter);

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
