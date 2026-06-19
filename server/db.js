// server/db.js
const { PrismaClient } = require('@prisma/client');

// On crée une instance unique du client Prisma pour tout le projet
const prisma = new PrismaClient();

module.exports = prisma;