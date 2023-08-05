const connectToMongo = require("./db")
const express = require('express')
const cors = require('cors')
const { config } = require('dotenv');
config();
connectToMongo();
const port = process.env.PORT
const app = express()


// enabling CORS for any unknow origin(https://xyz.example.com)
app.use(cors());
app.use(express.json())
// Available Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

app.listen(port, () => {
  console.log(`iNotebook app listening on port http://localhost:${port}`)
})
