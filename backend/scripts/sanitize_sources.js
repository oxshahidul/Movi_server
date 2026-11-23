const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function sanitizeSources() {
  try {
    const sources = await prisma.videoSource.findMany();
    console.log(`Found ${sources.length} video sources to check.`);

    let updated = 0;
    for (const source of sources) {
      // If it contains SamOnline or BDIX or has full path, standardize to Server 1
      if (source.sourceName.includes('SamOnline') || source.sourceName.includes('BDIX') || source.sourceName.includes('Server')) {
        await prisma.videoSource.update({
          where: { id: source.id },
          data: {
            sourceName: 'Server 1',
          },
        });
        updated++;
      }
    }

    console.log(`✅ Successfully updated ${updated} video sources to 'Server 1'.`);
  } catch (err) {
    console.error('Error sanitizing sources:', err);
  } finally {
    await prisma.$disconnect();
  }
}

sanitizeSources();
