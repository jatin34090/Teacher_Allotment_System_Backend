const express = require("express");
const connectDB = require("./config/db");
require('dotenv').config();
const cors = require('cors');
const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;
connectDB();

app.use(express.json());

app.use(require('./routes/auth'))
app.use(require('./routes/teacher'))
app.use(require('./routes/room'))
app.use(require('./routes/allotment'))
app.use(require('./routes/date'))


app.listen(PORT, () => console.log(`Server started on port ${PORT}`))


