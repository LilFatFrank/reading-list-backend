import express from 'express';
// import resourceRoutes from './routes/resourceRoutes';
import bot from './bot/botHandler';  // Import the bot
import mongoose from 'mongoose';
import config from './config';
import router from './routes/resouceRoutes';

const cors = require("cors");

const app = express();
app.use(cors({
  origin: 'http://localhost:3000'
}));

app.use(express.json());
app.use('/reading-list', router);

const mongoDBUri = config.mongoDbUri as string;
mongoose.connect(mongoDBUri);

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error: ' + err);
  process.exit(-1);
});

const PORT = config.port || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  bot.startPolling();  // Start the bot
});

export default app;
