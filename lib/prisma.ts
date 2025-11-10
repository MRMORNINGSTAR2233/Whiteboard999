import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Determine Prisma log level based on environment variable
 * Options: 'default' (warn/error only), 'verbose' (includes queries), 'debug' (all logs)
 */
const getLogLevel = () => {
  const logLevel = process.env.PRISMA_LOG_LEVEL
  
  if (logLevel === 'debug') {
    return ['query', 'info', 'warn', 'error']
  }
  
  if (logLevel === 'verbose') {
    return ['query', 'warn', 'error']
  }
  
  // Default: only warnings and errors
  return process.env.NODE_ENV === 'development' 
    ? ['warn', 'error'] 
    : ['error']
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: getLogLevel(),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
