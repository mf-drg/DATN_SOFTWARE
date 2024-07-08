import 'dotenv/config';
import * as http from 'http'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { logger, httpLogger } from './utils/logger.js'
import routers from './routes/v1/index.js'
import { errorHandler } from './middlewares/index.js'

const bootstrap = async () => {
  try {
    const app = express()
    const server = http.Server(app)
    app.use(cors({ origin: '*' }))
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))

    app.use(httpLogger)
    routers(app)
    app.use(errorHandler)
    server.listen(process.env.EXPRESS_PORT || 80, () => {
      logger.info(`Server listening on port ${process.env.EXPRESS_PORT}`)
    })
  } catch (e) {
    logger.error(e)
  }
}

bootstrap()
