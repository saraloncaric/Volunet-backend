import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import auth_router from './routes/auth_router.js';
import voloner_router from './routes/volonter_router.js';
import udruga_router from './routes/udruga_router.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/api/users', auth_router);
app.use('/api/volonter', voloner_router);
app.use('/api/udruga', udruga_router);

app.get('/', (req, res) => {
    res.send('API radi');
})
app.listen(PORT, () => {
    console.log(`Server radi na portu ${PORT}`);
})