import { createApp } from "./app";
import { config } from "./config";
import prisma from "./prisma/client";

const app = createApp();

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Connected to XAMPP MySQL (screenbox_db)");

    app.listen(config.port, () => {
      console.log(`🚀 ScreenBox API server listening on http://localhost:${config.port}`);
      console.log(`📡 Healthcheck available at http://localhost:${config.port}/api/v1/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
