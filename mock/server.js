const express = require('express')
var cors = require('cors')
const videos = require('./videos.json')
const app = express()
const port = 3001

app.use(cors())

app.get('/videos', (req, res) => {
    const pageToken = req.query.pageToken;
    const result = pageToken ? videos.find((video) => video.pageToken === pageToken) : videos[0]
    res.json(result)
})

app.listen(port, () => console.log(`Mock server listening on port ${port}.`))