const express = require('express')
var cors = require('cors')
const youtubedl = require('youtube-dl')
const videos = require('./videos.json')
const app = express()
const port = 3001

app.use(cors())

app.get('/videos', (req, res) => {
    const pageToken = req.query.pageToken;
    const result = pageToken ? videos.find((video) => video.pageToken === pageToken) : videos[0]
    res.json(result)
})

app.get('/videos/:id', (req, res) => {
    const url = `http://www.youtube.com/watch?v=${req.params.id}`
    youtubedl.getInfo(url, [], function(err, info) {
        if (err) throw err
      
        console.log('id:', info.id)
        console.log('title:', info.title)
        console.log('url:', info.url)
        console.log('thumbnail:', info.thumbnail)
        console.log('description:', info.description)
        console.log('filename:', info._filename)
        console.log('format id:', info.format_id)
        
        res.json({
            url: info.url
        })
    })
})

app.listen(port, () => console.log(`Mock server listening on port ${port}.`))