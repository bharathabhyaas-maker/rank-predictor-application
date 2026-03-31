// Working Prisma client import
const { PrismaClient } = require('@prisma/client')

// Create client with proper configuration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres:Bharathteja@localhost:5432/rank-predictor",
    },
  },
})

module.exports = { prisma }
