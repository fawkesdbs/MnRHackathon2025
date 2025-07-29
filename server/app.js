require('dotenv').config();

const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const monitoredDestinationRoutes = require('./routes/monitoredDestinationRoutes');
const alertRoutes = require('./routes/alertRoutes');
const healthRoute = require('./routes/health');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/monitored-destinations', monitoredDestinationRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/', healthRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
