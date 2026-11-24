const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const genres = await prisma.genre.findMany();
  console.log('Genres in DB:', genres.map(g => ({ id: g.id, name: g.name, slug: g.slug })));
  
  const series = await prisma.series.findMany({
    include: {
      genres: {
        include: {
          genre: true
        }
      },
      seasons: {
        include: {
          episodes: true
        }
      }
    }
  });
  console.log('Total series count:', series.length);
  const byGenre = {};
  series.forEach(s => {
    s.genres.forEach(g => {
      byGenre[g.genre.name] = (byGenre[g.genre.name] || 0) + 1;
    });
  });
  console.log('Series count by genre:', byGenre);
  await prisma.$disconnect();
}
check();
