const express = require('express')
const path = require('path')
const app = express()
const graphqlHTTP = require('express-graphql')
const dotenv = require('dotenv').config()
const PORT = process.env.PORT //|| 1500
const schema = require('./schema/schema')
const cors = require('cors')
const redis = require('redis')
const { RediQLess } = require('rediqless')
const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379,
})

// --> REQUIRE REDIQL MW

const RediQL = new RediQLess(redisClient)
const RediQLQuery = RediQL.query
const RediQLClear = RediQL.clearCache

app.use(cors())

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

/**
* @description
*
* gqlHTTP works as middleware
we tell our app to head to the directory ofgraphql
then it hands off thecontrol of the request to graphqlHTTP()
make sure to access it on the gqlHTTP object
*
*/

app.use('/rediql', RediQLQuery, (req, res) => {
  // console.log('res.locals.query => ', res.locals.query);
  // console.log('req.body.query =>', req.body.data.query)
  console.log('exiting rediql endpoint', res.locals.query)
  res.send(res.locals.query)
})

app.use('/clearcache', RediQLClear, (req, res) => {
  res.send('cache cleared')
})

app.use(`/graphql`, graphqlHTTP.graphqlHTTP({ schema, graphiql: true }))

// statically serve everything in the build folder on the route '/build'
app.use('/build', express.static(path.join(__dirname, '../build')))
// serve index.html on the route '/'
app.get('/', (req, res) => {
  return res.sendFile(path.join(__dirname, '../index.html'))
})
// // Catch all unknown routes(404)

app.use((err, req, res, next) => {
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 400,
    message: { err: 'An error occurred' },
  }
  const errorObj = Object.assign({}, defaultErr, err)
  console.log(errorObj.log)
  return res.status(errorObj.status).json(errorObj.message)
})

//start server
app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}/graphql`)
})
