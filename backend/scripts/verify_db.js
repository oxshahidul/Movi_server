const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  try {
    const movieCount = await prisma.movie.count();
    const sourceCount = await prisma.videoSource.count();
    const genreCount = await prisma.genre.count();
    const castCount = await prisma.cast.count();

    console.log('=== DATABASE VERIFICATION ===');
    console.log('Total Movies in DB:', movieCount);
    console.log('Total Video Sources in DB:', sourceCount);
    console.log('Total Genres in DB:', genreCount);
    console.log('Total Cast Members in DB:', castCount);

    const latestMovies = await prisma.movie.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        videoSources: true,
        genres: { include: { genre: true } },
      },
    });

    console.log('\n=== LATEST 5 INGESTED MOVIES ===');
    latestMovies.forEach((m, idx) => {
      console.log(`${idx + 1}. ${m.title} (${m.releaseYear}) - Rating: ${m.rating} ⭐`);
      console.log(`   Poster: ${m.poster}`);
      console.log(`   Trailer: ${m.trailerUrl}`);
      console.log(`   Genres: ${m.genres.map(g => g.genre.name).join(', ')}`);
      console.log(`   Video Stream: ${m.videoSources[0]?.sourceUrl}`);
    });
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
