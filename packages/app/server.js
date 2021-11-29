const express = require('express')
const app = express()
const port = process.env.PORT || 4000

app.use(express.static('dist'))

app.listen(port)
