import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import { config } from 'dotenv'
import { authRoutes } from './routes/auth.routes'
config()

const fastify = Fastify({ 
  logger: process.env.NODE_ENV === 'development' ? {
    level: 'info'
  } : true
})

fastify.register(cors, { 
  origin: process.env.NODE_ENV === 'production' ? false : true 
})
fastify.register(multipart)

fastify.register(authRoutes, { prefix: '/api/auth' })

fastify.get('/health', async () => {
  return { status: 'OK', timestamp: new Date().toISOString() }
})

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3001
    await fastify.listen({ port, host: '0.0.0.0' })
    console.log(`🚀 Server running on http://localhost:${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()