const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'invictustradingia@gmail.com';
  const passwordPlain = 'Invictus777';
  
  // Hasheamos la contraseña con bcrypt de forma segura
  const hashedPassword = await bcrypt.hash(passwordPlain, 10);

  // Verificamos si el usuario ya existe
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    // Si ya existe, actualizamos su contraseña y nos aseguramos de que sea ADMIN y esté APPROVED
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        role: 'ADMIN',
        status: 'APPROVED',
        isBanned: false
      }
    });
    console.log('¡Usuario Administrador actualizado con éxito en Supabase!');
  } else {
    // Si no existe, lo creamos desde cero
    await prisma.user.create({
      data: {
        name: 'Administrador Invictus',
        email: email,
        password: hashedPassword,
        role: 'ADMIN',
        status: 'APPROVED',
        isBanned: false
      }
    });
    console.log('¡Usuario Administrador creado con éxito en Supabase!');
  }
}

main()
  .catch((e) => {
    console.error('Error al configurar el admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });