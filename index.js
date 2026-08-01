import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io'

import auth_router from './routes/auth_router.js';
import voloner_router from './routes/volonter_router.js';
import udruga_router from './routes/udruga_router.js';
import zadaci_router from './routes/zadaci_router.js';
import applications_router from './routes/applications_router.js';
import recenzije_router from './routes/recenzije_router.js';
import obavijesti_router from './routes/obavijesti_router.js';
import chat_router from './routes/chat_router.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use('/api/users', auth_router);
app.use('/api/volonter', voloner_router);
app.use('/api/udruga', udruga_router);
app.use('/api/zadaci', zadaci_router);
app.use('/api/zadacivolonteri', applications_router);
app.use('/api/recenzije', recenzije_router);
app.use('/api/notifications', obavijesti_router);
app.use('/api/chat', chat_router);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log('Korisnik spojen: ', socket.id);
    socket.on('disconnect', () => {
        console.log('Korisnik odspojen:', socket.id);
    })
})

app.get('/', (req, res) => {
    res.send('API radi');
})
server.listen(PORT, () => {
    console.log(`Server radi na portu ${PORT}`);
})