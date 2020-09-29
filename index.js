const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const cors = require('cors')

const itemRoute = require('./src/routes/items')
const categoryRoute = require('./src/routes/category')
const authRouter = require('./src/routes/auth')
const cartRouter = require('./src/routes/cart')
const publicRoute = require('./src/routes/public')
const conditionRoute = require('./src/routes/condition')
const colorRoute = require('./src/routes/color')
const roleRoute = require('./src/routes/role')
require('dotenv').config()

const { verifyAccessToken } = require('./src/middleware/auth')

app.use(cors())

app.use(bodyParser.urlencoded({
  extended: false
}))

app.use('/item', verifyAccessToken, itemRoute)
app.use('/category', categoryRoute)
app.use('/auth', authRouter)
app.use('/cart', verifyAccessToken, cartRouter)
app.use('/public', publicRoute)
app.use('/condition', verifyAccessToken, conditionRoute)
app.use('/color', verifyAccessToken, colorRoute)
app.use('/role', verifyAccessToken, roleRoute)

// Error handler http request
app.use(async (req, res, next) => {
  next(new Error('Not Found'))
})

app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.send({
    error: {
      succes: false,
      status: err.status || 500,
      message: err.message
    }
  })
})

app.listen(8080, () => {
  console.log('running on port:8000')
})
