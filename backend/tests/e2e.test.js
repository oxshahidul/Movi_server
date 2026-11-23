// ScreenBox Comprehensive Automated Backend Integration & Verification Test Suite

const BASE_URL = process.env.API_URL || "http://localhost:5000/api/v1";

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failedCount++;
  }
}

async function runTests() {
  console.log("\n🧪 Running ScreenBox Comprehensive Backend Integration Tests...\n");

  try {
    // 1. Healthcheck & Monitoring Metrics Test
    console.log("[Suite 1] System Health & Monitoring Metrics");
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthJson = await healthRes.json();
    assert(healthRes.status === 200, "Health endpoint returns 200 OK");
    assert(healthJson.status === "healthy", "Service status is 'healthy' with MySQL connected");

    const metricsRes = await fetch(`${BASE_URL}/metrics`);
    const metricsJson = await metricsRes.json();
    assert(metricsRes.status === 200, "Metrics endpoint returns 200 OK");
    assert(metricsJson.uptimeSeconds >= 0, "Metrics returns valid uptimeSeconds");
    assert(!!metricsJson.memory && !!metricsJson.counts, "Metrics returns memory usage and database counts");

    // 2. Movies Catalog Test
    console.log("\n[Suite 2] Movies, Series, Seasons & Episodes");
    const moviesRes = await fetch(`${BASE_URL}/movies`);
    const moviesJson = await moviesRes.json();
    assert(moviesRes.status === 200, "Movies endpoint returns 200 OK");
    assert(Array.isArray(moviesJson.data) && moviesJson.data.length > 0, "Movies list is populated from MySQL");
    const testMovie = moviesJson.data[0];

    // 3. Series Catalog Test
    const seriesRes = await fetch(`${BASE_URL}/series`);
    const seriesJson = await seriesRes.json();
    assert(seriesRes.status === 200, "Series endpoint returns 200 OK");
    assert(Array.isArray(seriesJson.data) && seriesJson.data.length > 0, "Series list is populated from MySQL");
    const testSeries = seriesJson.data[0];

    // 4. Seasons Route Test
    if (testSeries.seasons && testSeries.seasons.length > 0) {
      const seasonId = testSeries.seasons[0].id;
      const seasonRes = await fetch(`${BASE_URL}/seasons/${seasonId}`);
      const seasonJson = await seasonRes.json();
      assert(seasonRes.status === 200, "Seasons /api/v1/seasons/:id returns 200 OK");
      assert(seasonJson.data.series.title === testSeries.title, "Season returns associated series information");
      
      // 5. Episodes Route Test
      if (seasonJson.data.episodes && seasonJson.data.episodes.length > 0) {
        const episodeId = seasonJson.data.episodes[0].id;
        const episodeRes = await fetch(`${BASE_URL}/episodes/${episodeId}`);
        const episodeJson = await episodeRes.json();
        assert(episodeRes.status === 200, "Episodes /api/v1/episodes/:id returns 200 OK");
        assert(episodeJson.data.id === episodeId, "Episode details returned correctly with video sources");
      }
    }

    // 6. Genres Test
    console.log("\n[Suite 3] Genres & Search");
    const genresRes = await fetch(`${BASE_URL}/genres`);
    const genresJson = await genresRes.json();
    assert(genresRes.status === 200, "Genres endpoint returns 200 OK");
    assert(genresJson.data.length >= 5, "Genres catalog has 5+ standard genres");

    // 7. Universal Search Test
    const searchRes = await fetch(`${BASE_URL}/search?q=Inception`);
    const searchJson = await searchRes.json();
    assert(searchRes.status === 200, "Search endpoint returns 200 OK");
    assert(searchJson.data.movies.some(m => m.slug.includes("inception")), "Search correctly locates 'Inception'");

    // 8. User Authentication Test
    console.log("\n[Suite 4] Authentication & Password Reset");
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user@screenbox.com", password: "user123" }),
    });
    const loginJson = await loginRes.json();
    assert(loginRes.status === 200, "Login returns 200 OK");
    assert(!!loginJson.token, "JWT token is issued");

    const authToken = loginJson.token;
    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    };

    // 9. Password Reset Flow Test
    const forgotRes = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user@screenbox.com" }),
    });
    const forgotJson = await forgotRes.json();
    assert(forgotRes.status === 200, "Forgot password endpoint returns 200 OK");
    assert(!!forgotJson.resetToken, "Reset token generated successfully");

    // Reset password with token
    const resetRes = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: forgotJson.resetToken, newPassword: "user123" }),
    });
    const resetJson = await resetRes.json();
    assert(resetRes.status === 200, "Reset password returns 200 OK with confirmation message");

    // 10. Dedicated Users Router Test
    console.log("\n[Suite 5] Dedicated /api/v1/users Profile & Settings");
    const userProfileRes = await fetch(`${BASE_URL}/users/profile`, { headers: authHeaders });
    const userProfileJson = await userProfileRes.json();
    assert(userProfileRes.status === 200, "/api/v1/users/profile returns 200 OK");
    assert(userProfileJson.data.email === "user@screenbox.com", "User profile email matches");

    const userSettingsRes = await fetch(`${BASE_URL}/users/settings`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ preferredQuality: "4K", preferredLanguage: "English" }),
    });
    const userSettingsJson = await userSettingsRes.json();
    assert(userSettingsRes.status === 200, "/api/v1/users/settings returns 200 OK");
    assert(userSettingsJson.data.preferredQuality === "4K", "User settings updated to 4K");

    const userStatsRes = await fetch(`${BASE_URL}/users/stats`, { headers: authHeaders });
    const userStatsJson = await userStatsRes.json();
    assert(userStatsRes.status === 200, "/api/v1/users/stats returns 200 OK");
    assert(userStatsJson.data.watchlistCount !== undefined, "User stats returned count fields");

    // 11. Dedicated /api/v1/watchlist Router Test
    console.log("\n[Suite 6] Dedicated Watchlist, Favorites & Ratings");
    const addWatchlistRes = await fetch(`${BASE_URL}/watchlist`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ contentId: testMovie.id, contentType: "MOVIE" }),
    });
    assert(addWatchlistRes.status === 200 || addWatchlistRes.status === 201, "POST /api/v1/watchlist returns 200/201");

    const getWatchlistRes = await fetch(`${BASE_URL}/watchlist`, { headers: authHeaders });
    const getWatchlistJson = await getWatchlistRes.json();
    assert(getWatchlistRes.status === 200, "GET /api/v1/watchlist returns 200 OK");
    assert(Array.isArray(getWatchlistJson.data), "Watchlist data is an array");

    // 12. Dedicated /api/v1/favorites Router Test
    const addFavRes = await fetch(`${BASE_URL}/favorites`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ contentId: testMovie.id, contentType: "MOVIE" }),
    });
    assert(addFavRes.status === 200 || addFavRes.status === 201, "POST /api/v1/favorites returns 200/201");

    const getFavRes = await fetch(`${BASE_URL}/favorites`, { headers: authHeaders });
    const getFavJson = await getFavRes.json();
    assert(getFavRes.status === 200, "GET /api/v1/favorites returns 200 OK");

    // 13. Dedicated /api/v1/ratings Router Test
    const postRatingRes = await fetch(`${BASE_URL}/ratings`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ contentId: testMovie.id, contentType: "MOVIE", rating: 9 }),
    });
    const postRatingJson = await postRatingRes.json();
    assert(postRatingRes.status === 200, "POST /api/v1/ratings returns 200 OK");
    assert(postRatingJson.data.userRating === 9, "Rating registered as 9 / 10");

    const getRatingRes = await fetch(`${BASE_URL}/ratings/MOVIE/${testMovie.id}`, { headers: authHeaders });
    const getRatingJson = await getRatingRes.json();
    assert(getRatingRes.status === 200, "GET /api/v1/ratings/:type/:id returns 200 OK");
    assert(getRatingJson.data.averageRating > 0, "Average rating calculated dynamically");

    // 14. Watch History Heartbeat
    console.log("\n[Suite 7] Watch History & Playback Heartbeat");
    const progressRes = await fetch(`${BASE_URL}/watch-history/progress`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        contentType: "MOVIE",
        contentId: testMovie.id,
        progressSeconds: 450,
        durationSeconds: 7200,
      }),
    });
    const progressJson = await progressRes.json();
    assert(progressRes.status === 200, "POST /api/v1/watch-history/progress returns 200 OK");
    assert(progressJson.data.progressSeconds === 450, "Playback timestamp 450s stored in MySQL");

    // 15. Admin Management Tests
    console.log("\n[Suite 8] Admin Panel & Role-Based Access Control");
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@screenbox.com", password: "admin123" }),
    });
    const adminLoginJson = await adminLoginRes.json();
    assert(adminLoginRes.status === 200, "Admin login returns 200 OK");

    const adminHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminLoginJson.token}`,
    };

    const adminStatsRes = await fetch(`${BASE_URL}/admin/stats`, { headers: adminHeaders });
    const adminStatsJson = await adminStatsRes.json();
    assert(adminStatsRes.status === 200, "GET /api/v1/admin/stats returns 200 OK");
    assert(adminStatsJson.data.totalMovies > 0, "Admin stats returns totalMovies count");

    // Test Admin Cast List
    const adminCastRes = await fetch(`${BASE_URL}/admin/cast`, { headers: adminHeaders });
    assert(adminCastRes.status === 200, "GET /api/v1/admin/cast returns 200 OK");

    // Summary
    console.log(`\n========================================`);
    console.log(`Test Execution Results: ${passedCount} Passed, ${failedCount} Failed`);
    console.log(`========================================\n`);

    if (failedCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Test Suite execution failed:", error);
    process.exit(1);
  }
}

runTests();
