const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Conexión directa a Supabase
process.env.DATABASE_URL = "postgresql://postgres.vlrmrxnzqzmpllydiukv:InvictusTrading777@aws-0-us-east-1.pooler.supabase.com:5432/postgres";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Invictus777', 10);

  // Limpia registros anteriores con este correo
  await prisma.user.deleteMany({ where: { email: 'invictustradingia@gmail.com' } });

  // Crea el Administrador con el hash bcrypt que espera NextAuth
  const user = await prisma.user.create({
    data: {
      name: 'Administracion Invictus',
      email: 'invictustradingia@gmail.com',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'APPROVED'
    }
  });

  console.log('--------------------------------------------------');
  console.log('¡USUARIO ADMIN CREADO EXITOSAMENTE EN SUPABASE!');
  console.log('Nombre:', user.name);
  console.log('Email:', user.email);
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => console.error('ERROR AL CREAR:', e))
  .finally(async () => await prisma.$disconnect());