import { PrismaClient, RoleType, ContentType, ContentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting ScreenBox database seeding...");

  // 1. Roles
  const roles = [
    { name: "SUPER_ADMIN", description: "Full system access and user management" },
    { name: "ADMIN", description: "Content management and moderation" },
    { name: "CONTENT_MANAGER", description: "Upload and edit movies and series" },
    { name: "MODERATOR", description: "Community and review moderation" },
    { name: "USER", description: "Standard streaming consumer" },
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
  }
  console.log("✅ Roles seeded");

  // 2. Default Users
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const userPasswordHash = await bcrypt.hash("user123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@screenbox.com" },
    update: {},
    create: {
      name: "ScreenBox Admin",
      email: "admin@screenbox.com",
      password: adminPasswordHash,
      role: RoleType.SUPER_ADMIN,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      status: "ACTIVE",
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: "user@screenbox.com" },
    update: {},
    create: {
      name: "Tariqul Islam",
      email: "user@screenbox.com",
      password: userPasswordHash,
      role: RoleType.USER,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      status: "ACTIVE",
    },
  });

  // User Settings
  await prisma.userSettings.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      autoplay: true,
      preferredQuality: "1080p",
      preferredLanguage: "English",
      subtitleLanguage: "English",
    },
  });
  console.log("✅ Users seeded (admin@screenbox.com, user@screenbox.com)");

  // 3. Genres
  const genresList = [
    { name: "Action", slug: "action" },
    { name: "Adventure", slug: "adventure" },
    { name: "Sci-Fi", slug: "sci-fi" },
    { name: "Drama", slug: "drama" },
    { name: "Thriller", slug: "thriller" },
    { name: "Comedy", slug: "comedy" },
    { name: "Crime", slug: "crime" },
    { name: "Animation", slug: "animation" },
    { name: "Bangla Originals", slug: "bangla-originals" },
    { name: "Horror", slug: "horror" },
  ];

  const genreMap = new Map<string, number>();
  for (const g of genresList) {
    const created = await prisma.genre.upsert({
      where: { slug: g.slug },
      update: {},
      create: g,
    });
    genreMap.set(g.slug, created.id);
  }
  console.log("✅ Genres seeded");

  // 4. Sample Cast Members
  const castMembers = [
    {
      name: "Cillian Murphy",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
      biography: "Acclaimed Irish actor renowned for intense dramatic roles.",
    },
    {
      name: "Florence Pugh",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
      biography: "English actress known for her versatility across thrillers and period dramas.",
    },
    {
      name: "Chanchal Chowdhury",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80",
      biography: "Prolific Bangladeshi actor known for critically acclaimed suspense series and films.",
    },
    {
      name: "Millie Bobby Brown",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
      biography: "British actress best known for her role in iconic sci-fi mystery shows.",
    },
  ];

  const castMap = new Map<string, string>();
  for (const c of castMembers) {
    const existing = await prisma.cast.findFirst({ where: { name: c.name } });
    if (existing) {
      castMap.set(c.name, existing.id);
    } else {
      const created = await prisma.cast.create({ data: c });
      castMap.set(c.name, created.id);
    }
  }
  console.log("✅ Cast seeded");

  // 5. Movies
  const sampleMovies = [
    {
      title: "Inception: Dream Protocol",
      slug: "inception-dream-protocol",
      description: "A skilled thief is given a chance to have his criminal history erased if he can successfully perform inception: planting an idea into the mind of a CEO.",
      poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
      backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80",
      trailerUrl: "https://www.youtube.com/watch?v=YoHD9XEInc0",
      releaseYear: 2024,
      runtime: 148,
      rating: 8.8,
      language: "English",
      status: ContentStatus.PUBLISHED,
      genres: ["action", "sci-fi", "thriller"],
      cast: [{ name: "Cillian Murphy", character: "Robert Fischer" }],
      sources: [
        {
          sourceName: "BDIX CDN 1 (HLS)",
          sourceUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
          quality: "1080p",
          format: "HLS",
        },
        {
          sourceName: "Backup Stream (MP4)",
          sourceUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          quality: "720p",
          format: "MP4",
        },
      ],
      subtitles: [
        { language: "English", subtitleUrl: "https://raw.githubusercontent.com/brenopolanski/html5-video-webvtt-example/master/subtitles/subtitles-en.vtt", format: "VTT" },
      ],
    },
    {
      title: "Cyberpunk 2099: Neon Horizon",
      slug: "cyberpunk-2099-neon-horizon",
      description: "In a neon-drenched metropolis governed by rogue corporate AI, an outlaw netrunner embarks on a high-stakes heist to unlock humanity's last preserved consciousness.",
      poster: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
      backdrop: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&auto=format&fit=crop&q=80",
      trailerUrl: "https://www.youtube.com/watch?v=LembwKDo1Dk",
      releaseYear: 2025,
      runtime: 132,
      rating: 8.4,
      language: "English",
      status: ContentStatus.PUBLISHED,
      genres: ["sci-fi", "action", "thriller"],
      cast: [{ name: "Florence Pugh", character: "Vesper Zero" }],
      sources: [
        {
          sourceName: "BDIX Fast Server (HLS)",
          sourceUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
          quality: "1080p",
          format: "MP4",
        },
      ],
      subtitles: [
        { language: "English", subtitleUrl: "https://raw.githubusercontent.com/brenopolanski/html5-video-webvtt-example/master/subtitles/subtitles-en.vtt", format: "VTT" },
      ],
    },
    {
      title: "Hawa: Secrets of the Deep Sea",
      slug: "hawa-secrets-of-the-deep-sea",
      description: "A group of fishermen adrift in the Bay of Bengal catch a mysterious girl in their net, triggering inexplicable events and supernatural dread aboard the wooden trawler.",
      poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
      backdrop: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80",
      trailerUrl: "https://www.youtube.com/watch?v=mqqft2x_Aa4",
      releaseYear: 2024,
      runtime: 138,
      rating: 8.9,
      language: "Bengali",
      status: ContentStatus.PUBLISHED,
      genres: ["bangla-originals", "drama", "thriller"],
      cast: [{ name: "Chanchal Chowdhury", character: "Chan Majhi" }],
      sources: [
        {
          sourceName: "Dhaka BDIX Server (HLS)",
          sourceUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
          quality: "1080p",
          format: "HLS",
        },
      ],
      subtitles: [
        { language: "English", subtitleUrl: "https://raw.githubusercontent.com/brenopolanski/html5-video-webvtt-example/master/subtitles/subtitles-en.vtt", format: "VTT" },
      ],
    },
    {
      title: "Interstellar: Echoes of Eternity",
      slug: "interstellar-echoes-of-eternity",
      description: "When Earth becomes uninhabitable, a team of courageous explorers undertakes the most vital mission in human history: traveling through a wormhole to find a new home.",
      poster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
      backdrop: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&auto=format&fit=crop&q=80",
      trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
      releaseYear: 2023,
      runtime: 169,
      rating: 9.1,
      language: "English",
      status: ContentStatus.PUBLISHED,
      genres: ["sci-fi", "adventure", "drama"],
      cast: [{ name: "Cillian Murphy", character: "Dr. Scott" }],
      sources: [
        {
          sourceName: "Premium 4K Stream",
          sourceUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
          quality: "1080p",
          format: "MP4",
        },
      ],
      subtitles: [],
    },
  ];

  for (const m of sampleMovies) {
    const existing = await prisma.movie.findUnique({ where: { slug: m.slug } });
    if (!existing) {
      const createdMovie = await prisma.movie.create({
        data: {
          title: m.title,
          slug: m.slug,
          description: m.description,
          poster: m.poster,
          backdrop: m.backdrop,
          trailerUrl: m.trailerUrl,
          releaseYear: m.releaseYear,
          runtime: m.runtime,
          rating: m.rating,
          language: m.language,
          status: m.status,
          publishedAt: new Date(),
        },
      });

      // Genres
      for (const gSlug of m.genres) {
        const gid = genreMap.get(gSlug);
        if (gid) {
          await prisma.movieGenre.create({
            data: { movieId: createdMovie.id, genreId: gid },
          });
        }
      }

      // Cast
      for (const c of m.cast) {
        const cid = castMap.get(c.name);
        if (cid) {
          await prisma.contentCast.create({
            data: {
              movieId: createdMovie.id,
              castId: cid,
              characterName: c.character,
            },
          });
        }
      }

      // Video Sources
      for (const s of m.sources) {
        await prisma.videoSource.create({
          data: {
            contentType: ContentType.MOVIE,
            movieId: createdMovie.id,
            sourceName: s.sourceName,
            sourceUrl: s.sourceUrl,
            quality: s.quality,
            format: s.format,
          },
        });
      }

      // Subtitles
      for (const sub of m.subtitles) {
        await prisma.subtitle.create({
          data: {
            contentType: ContentType.MOVIE,
            movieId: createdMovie.id,
            language: sub.language,
            subtitleUrl: sub.subtitleUrl,
            format: sub.format,
          },
        });
      }
    }
  }
  console.log("✅ Movies seeded");

  // 6. Series with Seasons and Episodes
  const sampleSeries = [
    {
      title: "Stranger Anomalies",
      slug: "stranger-anomalies",
      description: "When a young boy vanishes into thin air, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.",
      poster: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
      backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80",
      trailerUrl: "https://www.youtube.com/watch?v=b9EkMc79ZSU",
      releaseYear: 2024,
      rating: 8.7,
      genres: ["sci-fi", "drama", "thriller"],
      cast: [{ name: "Millie Bobby Brown", character: "Eleven / El" }],
      seasons: [
        {
          seasonNumber: 1,
          title: "Season 1: The Disappearance",
          description: "Strange occurrences plague Hawkins as the search begins.",
          episodes: [
            {
              episodeNumber: 1,
              title: "Chapter One: The Vanishing",
              slug: "stranger-anomalies-s01e01",
              description: "On his way home from a friend's house, young Will sees something terrifying. Nearby, a secret laboratory unleashes an entity.",
              thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80",
              runtime: 48,
              sourceUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
            },
            {
              episodeNumber: 2,
              title: "Chapter Two: The Weirdo on Maple Street",
              slug: "stranger-anomalies-s01e02",
              description: "Lucas, Mike and Dustin try to talk to the girl they found in the woods. Hopper questions an anxious Joyce about a phone call.",
              thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
              runtime: 55,
              sourceUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            },
          ],
        },
      ],
    },
    {
      title: "Karagar: Cell 501",
      slug: "karagar-cell-501",
      description: "In a high-security prison, a man mysteriously appears locked in Cell 501, which has been abandoned for fifty years. He claims he cannot speak Bengali and doesn't belong to this era.",
      poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
      backdrop: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1600&auto=format&fit=crop&q=80",
      trailerUrl: "https://www.youtube.com/watch?v=eBGIQ7ZuuiU",
      releaseYear: 2023,
      rating: 9.2,
      genres: ["bangla-originals", "crime", "thriller"],
      cast: [{ name: "Chanchal Chowdhury", character: "David Mystery" }],
      seasons: [
        {
          seasonNumber: 1,
          title: "Part 1: The Mystery Inmate",
          description: "Cell 501 opens after 50 years to reveal an impossible mystery.",
          episodes: [
            {
              episodeNumber: 1,
              title: "The Silent Prisoner",
              slug: "karagar-s01e01",
              description: "A mysterious prisoner appears in an abandoned cell. He communicates only through sign language.",
              thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80",
              runtime: 42,
              sourceUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
            },
          ],
        },
      ],
    },
  ];

  for (const s of sampleSeries) {
    const existing = await prisma.series.findUnique({ where: { slug: s.slug } });
    if (!existing) {
      const createdSeries = await prisma.series.create({
        data: {
          title: s.title,
          slug: s.slug,
          description: s.description,
          poster: s.poster,
          backdrop: s.backdrop,
          trailerUrl: s.trailerUrl,
          releaseYear: s.releaseYear,
          rating: s.rating,
          status: ContentStatus.PUBLISHED,
        },
      });

      for (const gSlug of s.genres) {
        const gid = genreMap.get(gSlug);
        if (gid) {
          await prisma.seriesGenre.create({
            data: { seriesId: createdSeries.id, genreId: gid },
          });
        }
      }

      for (const c of s.cast) {
        const cid = castMap.get(c.name);
        if (cid) {
          await prisma.contentCast.create({
            data: {
              seriesId: createdSeries.id,
              castId: cid,
              characterName: c.character,
            },
          });
        }
      }

      for (const sn of s.seasons) {
        const createdSeason = await prisma.season.create({
          data: {
            seriesId: createdSeries.id,
            seasonNumber: sn.seasonNumber,
            title: sn.title,
            description: sn.description,
          },
        });

        for (const ep of sn.episodes) {
          const createdEp = await prisma.episode.create({
            data: {
              seasonId: createdSeason.id,
              episodeNumber: ep.episodeNumber,
              title: ep.title,
              slug: ep.slug,
              description: ep.description,
              thumbnail: ep.thumbnail,
              runtime: ep.runtime,
              status: ContentStatus.PUBLISHED,
            },
          });

          await prisma.videoSource.create({
            data: {
              contentType: ContentType.SERIES,
              episodeId: createdEp.id,
              sourceName: "Standard HLS",
              sourceUrl: ep.sourceUrl,
              quality: "1080p",
              format: "HLS",
            },
          });
        }
      }
    }
  }
  console.log("✅ Series, Seasons, and Episodes seeded");

  // 7. Seed Initial Watch History and Watchlist for demo user
  const firstMovie = await prisma.movie.findFirst();
  if (firstMovie) {
    await prisma.watchlist.upsert({
      where: {
        userId_contentId: {
          userId: demoUser.id,
          contentId: firstMovie.id,
        },
      },
      update: {},
      create: {
        userId: demoUser.id,
        contentType: ContentType.MOVIE,
        contentId: firstMovie.id,
      },
    });

    await prisma.watchHistory.upsert({
      where: {
        userId_contentId_episodeId: {
          userId: demoUser.id,
          contentId: firstMovie.id,
          episodeId: "",
        },
      },
      update: {
        progressSeconds: 1250,
        durationSeconds: 8880,
      },
      create: {
        userId: demoUser.id,
        contentType: ContentType.MOVIE,
        contentId: firstMovie.id,
        episodeId: "",
        progressSeconds: 1250,
        durationSeconds: 8880,
      },
    });
    console.log("✅ Demo user Watchlist & WatchHistory seeded");
  }

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
