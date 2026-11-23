/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.19-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: screenbox_db
-- ------------------------------------------------------
-- Server version	10.11.19-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES
('92f4ef1d-27cf-4f3f-9b53-cd332b2bf639','bf019a758a734bd7b9e91ecbce547627d8c1e30e73c663bac700fc79b705670a','2026-11-23 16:18:56.041','20261123161855_init',NULL,NULL,'2026-11-23 16:18:55.369',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` varchar(191) NOT NULL,
  `user_id` varchar(191) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(100) NOT NULL,
  `entity_id` varchar(100) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `audit_logs_user_id_idx` (`user_id`),
  KEY `audit_logs_created_at_idx` (`created_at`),
  CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cast`
--

DROP TABLE IF EXISTS `cast`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cast` (
  `id` varchar(191) NOT NULL,
  `name` varchar(255) NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `biography` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cast`
--

LOCK TABLES `cast` WRITE;
/*!40000 ALTER TABLE `cast` DISABLE KEYS */;
INSERT INTO `cast` VALUES
('2cb775d0-c78f-48cd-9a2f-95ef37a56398','Cillian Murphy','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80','Acclaimed Irish actor renowned for intense dramatic roles.'),
('9266ddff-c6d9-426e-a7ed-72a588bb7560','Millie Bobby Brown','https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80','British actress best known for her role in iconic sci-fi mystery shows.'),
('e77675f1-5e25-43f2-8438-2091dfaf4ac9','Florence Pugh','https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80','English actress known for her versatility across thrillers and period dramas.'),
('fad78106-bdf2-4e98-a429-779fe78052a1','Chanchal Chowdhury','https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80','Prolific Bangladeshi actor known for critically acclaimed suspense series and films.');
/*!40000 ALTER TABLE `cast` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `content_cast`
--

DROP TABLE IF EXISTS `content_cast`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `content_cast` (
  `id` varchar(191) NOT NULL,
  `cast_id` varchar(191) NOT NULL,
  `movie_id` varchar(191) DEFAULT NULL,
  `series_id` varchar(191) DEFAULT NULL,
  `character_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `content_cast_cast_id_idx` (`cast_id`),
  KEY `content_cast_movie_id_idx` (`movie_id`),
  KEY `content_cast_series_id_idx` (`series_id`),
  CONSTRAINT `content_cast_cast_id_fkey` FOREIGN KEY (`cast_id`) REFERENCES `cast` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `content_cast_movie_id_fkey` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `content_cast_series_id_fkey` FOREIGN KEY (`series_id`) REFERENCES `series` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `content_cast`
--

LOCK TABLES `content_cast` WRITE;
/*!40000 ALTER TABLE `content_cast` DISABLE KEYS */;
INSERT INTO `content_cast` VALUES
('0233b182-9223-4db9-afc1-8df8279f228c','2cb775d0-c78f-48cd-9a2f-95ef37a56398','ca4c0bdb-2d20-46ab-a719-d61d87098000',NULL,'Dr. Scott'),
('25461790-aa7f-4d36-837a-4696f53d641b','e77675f1-5e25-43f2-8438-2091dfaf4ac9','53446497-1fb5-46ef-8f3f-9d617049598f',NULL,'Vesper Zero'),
('74fdbeed-ff3b-45c1-bb7b-811f3fa8eb59','2cb775d0-c78f-48cd-9a2f-95ef37a56398','d8b13128-82f7-4c76-ab99-200c5c7b0d15',NULL,'Robert Fischer'),
('abed4b8e-460f-4eb4-843f-07fbebc65b8b','fad78106-bdf2-4e98-a429-779fe78052a1',NULL,'7bf21baa-d3ed-4d4e-bffc-39f95fda3f16','David Mystery'),
('d54263db-d4c9-44b1-9612-45c8b774671e','9266ddff-c6d9-426e-a7ed-72a588bb7560',NULL,'b2412dd9-58c5-4fdd-9279-54be9659e199','Eleven / El'),
('fc454f01-c5b1-49fd-b5e0-25ccdbaa5b00','fad78106-bdf2-4e98-a429-779fe78052a1','c02b7002-5677-46ce-99a2-95c72c6e8c10',NULL,'Chan Majhi');
/*!40000 ALTER TABLE `content_cast` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `episodes`
--

DROP TABLE IF EXISTS `episodes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `episodes` (
  `id` varchar(191) NOT NULL,
  `season_id` varchar(191) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `episode_number` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `thumbnail` varchar(500) DEFAULT NULL,
  `runtime` int(11) DEFAULT NULL,
  `release_date` datetime(3) DEFAULT NULL,
  `status` enum('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'PUBLISHED',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `episodes_slug_key` (`slug`),
  UNIQUE KEY `episodes_season_id_episode_number_key` (`season_id`,`episode_number`),
  KEY `episodes_season_id_idx` (`season_id`),
  CONSTRAINT `episodes_season_id_fkey` FOREIGN KEY (`season_id`) REFERENCES `seasons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `episodes`
--

LOCK TABLES `episodes` WRITE;
/*!40000 ALTER TABLE `episodes` DISABLE KEYS */;
INSERT INTO `episodes` VALUES
('07ae4b9c-02af-448d-918e-515775f0b777','03fb4319-0a3c-4dc3-ad6b-32bc2d5558ed','Chapter Two: The Weirdo on Maple Street','stranger-anomalies-s01e02',2,'Lucas, Mike and Dustin try to talk to the girl they found in the woods. Hopper questions an anxious Joyce about a phone call.','https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',55,NULL,'PUBLISHED','2026-11-23 16:19:50.472','2026-11-23 16:19:50.472'),
('415e9e5c-7bd7-4f36-81f7-6255f19ba15c','fd17b58e-b9d4-44cf-ac05-662440d9452a','The Silent Prisoner','karagar-s01e01',1,'A mysterious prisoner appears in an abandoned cell. He communicates only through sign language.','https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',42,NULL,'PUBLISHED','2026-11-23 16:19:50.492','2026-11-23 16:19:50.492'),
('c93e90ad-0d87-46ea-a8ee-231d9828628e','03fb4319-0a3c-4dc3-ad6b-32bc2d5558ed','Chapter One: The Vanishing','stranger-anomalies-s01e01',1,'On his way home from a friend\'s house, young Will sees something terrifying. Nearby, a secret laboratory unleashes an entity.','https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',48,NULL,'PUBLISHED','2026-11-23 16:19:50.464','2026-11-23 16:19:50.464');
/*!40000 ALTER TABLE `episodes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `content_type` enum('MOVIE','SERIES') NOT NULL,
  `content_id` varchar(191) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `favorites_user_id_content_id_key` (`user_id`,`content_id`),
  KEY `favorites_user_id_idx` (`user_id`),
  CONSTRAINT `favorites_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `genres`
--

DROP TABLE IF EXISTS `genres`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `genres` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `genres_name_key` (`name`),
  UNIQUE KEY `genres_slug_key` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `genres`
--

LOCK TABLES `genres` WRITE;
/*!40000 ALTER TABLE `genres` DISABLE KEYS */;
INSERT INTO `genres` VALUES
(1,'Action','action'),
(2,'Adventure','adventure'),
(3,'Sci-Fi','sci-fi'),
(4,'Drama','drama'),
(5,'Thriller','thriller'),
(6,'Comedy','comedy'),
(7,'Crime','crime'),
(8,'Animation','animation'),
(9,'Bangla Originals','bangla-originals'),
(10,'Horror','horror');
/*!40000 ALTER TABLE `genres` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movie_genres`
--

DROP TABLE IF EXISTS `movie_genres`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `movie_genres` (
  `movie_id` varchar(191) NOT NULL,
  `genre_id` int(11) NOT NULL,
  PRIMARY KEY (`movie_id`,`genre_id`),
  KEY `movie_genres_genre_id_idx` (`genre_id`),
  CONSTRAINT `movie_genres_genre_id_fkey` FOREIGN KEY (`genre_id`) REFERENCES `genres` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `movie_genres_movie_id_fkey` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movie_genres`
--

LOCK TABLES `movie_genres` WRITE;
/*!40000 ALTER TABLE `movie_genres` DISABLE KEYS */;
INSERT INTO `movie_genres` VALUES
('53446497-1fb5-46ef-8f3f-9d617049598f',1),
('53446497-1fb5-46ef-8f3f-9d617049598f',3),
('53446497-1fb5-46ef-8f3f-9d617049598f',5),
('c02b7002-5677-46ce-99a2-95c72c6e8c10',4),
('c02b7002-5677-46ce-99a2-95c72c6e8c10',5),
('c02b7002-5677-46ce-99a2-95c72c6e8c10',9),
('ca4c0bdb-2d20-46ab-a719-d61d87098000',2),
('ca4c0bdb-2d20-46ab-a719-d61d87098000',3),
('ca4c0bdb-2d20-46ab-a719-d61d87098000',4),
('d8b13128-82f7-4c76-ab99-200c5c7b0d15',1),
('d8b13128-82f7-4c76-ab99-200c5c7b0d15',3),
('d8b13128-82f7-4c76-ab99-200c5c7b0d15',5);
/*!40000 ALTER TABLE `movie_genres` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movies`
--

DROP TABLE IF EXISTS `movies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `movies` (
  `id` varchar(191) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `poster` varchar(500) DEFAULT NULL,
  `backdrop` varchar(500) DEFAULT NULL,
  `trailer_url` varchar(500) DEFAULT NULL,
  `release_year` int(11) DEFAULT NULL,
  `runtime` int(11) DEFAULT NULL,
  `rating` decimal(3,1) DEFAULT 0.0,
  `language` varchar(50) DEFAULT 'English',
  `status` enum('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'PUBLISHED',
  `published_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `movies_slug_key` (`slug`),
  KEY `movies_slug_idx` (`slug`),
  KEY `movies_release_year_idx` (`release_year`),
  KEY `movies_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movies`
--

LOCK TABLES `movies` WRITE;
/*!40000 ALTER TABLE `movies` DISABLE KEYS */;
INSERT INTO `movies` VALUES
('53446497-1fb5-46ef-8f3f-9d617049598f','Cyberpunk 2099: Neon Horizon','cyberpunk-2099-neon-horizon','In a neon-drenched metropolis governed by rogue corporate AI, an outlaw netrunner embarks on a high-stakes heist to unlock humanity\'s last preserved consciousness.','https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&auto=format&fit=crop&q=80','https://www.youtube.com/watch?v=LembwKDo1Dk',2025,132,8.4,'English','PUBLISHED','2026-11-23 16:19:50.358','2026-11-23 16:19:50.359','2026-11-23 16:19:50.359'),
('c02b7002-5677-46ce-99a2-95c72c6e8c10','Hawa: Secrets of the Deep Sea','hawa-secrets-of-the-deep-sea','A group of fishermen adrift in the Bay of Bengal catch a mysterious girl in their net, triggering inexplicable events and supernatural dread aboard the wooden trawler.','https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80','https://www.youtube.com/watch?v=mqqft2x_Aa4',2024,138,8.9,'Bengali','PUBLISHED','2026-11-23 16:19:50.383','2026-11-23 16:19:50.384','2026-11-23 16:19:50.384'),
('ca4c0bdb-2d20-46ab-a719-d61d87098000','Interstellar: Echoes of Eternity','interstellar-echoes-of-eternity','When Earth becomes uninhabitable, a team of courageous explorers undertakes the most vital mission in human history: traveling through a wormhole to find a new home.','https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&auto=format&fit=crop&q=80','https://www.youtube.com/watch?v=zSWdZVtXT7E',2023,169,9.1,'English','PUBLISHED','2026-11-23 16:19:50.431','2026-11-23 16:19:50.431','2026-11-23 16:19:50.431'),
('d8b13128-82f7-4c76-ab99-200c5c7b0d15','Inception: Dream Protocol','inception-dream-protocol','A skilled thief is given a chance to have his criminal history erased if he can successfully perform inception: planting an idea into the mind of a CEO.','https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80','https://www.youtube.com/watch?v=YoHD9XEInc0',2024,148,8.8,'English','PUBLISHED','2026-11-23 16:19:50.328','2026-11-23 16:19:50.330','2026-11-23 16:19:50.330');
/*!40000 ALTER TABLE `movies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ratings`
--

DROP TABLE IF EXISTS `ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ratings` (
  `id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `content_type` enum('MOVIE','SERIES') NOT NULL,
  `content_id` varchar(191) NOT NULL,
  `rating` int(11) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ratings_user_id_content_id_key` (`user_id`,`content_id`),
  KEY `ratings_user_id_idx` (`user_id`),
  CONSTRAINT `ratings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ratings`
--

LOCK TABLES `ratings` WRITE;
/*!40000 ALTER TABLE `ratings` DISABLE KEYS */;
/*!40000 ALTER TABLE `ratings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_key` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES
(1,'SUPER_ADMIN','Full system access and user management'),
(2,'ADMIN','Content management and moderation'),
(3,'CONTENT_MANAGER','Upload and edit movies and series'),
(4,'MODERATOR','Community and review moderation'),
(5,'USER','Standard streaming consumer');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seasons`
--

DROP TABLE IF EXISTS `seasons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `seasons` (
  `id` varchar(191) NOT NULL,
  `series_id` varchar(191) NOT NULL,
  `season_number` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `poster` varchar(500) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `seasons_series_id_season_number_key` (`series_id`,`season_number`),
  KEY `seasons_series_id_idx` (`series_id`),
  CONSTRAINT `seasons_series_id_fkey` FOREIGN KEY (`series_id`) REFERENCES `series` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seasons`
--

LOCK TABLES `seasons` WRITE;
/*!40000 ALTER TABLE `seasons` DISABLE KEYS */;
INSERT INTO `seasons` VALUES
('03fb4319-0a3c-4dc3-ad6b-32bc2d5558ed','b2412dd9-58c5-4fdd-9279-54be9659e199',1,'Season 1: The Disappearance','Strange occurrences plague Hawkins as the search begins.',NULL,'2026-11-23 16:19:50.461','2026-11-23 16:19:50.461'),
('fd17b58e-b9d4-44cf-ac05-662440d9452a','7bf21baa-d3ed-4d4e-bffc-39f95fda3f16',1,'Part 1: The Mystery Inmate','Cell 501 opens after 50 years to reveal an impossible mystery.',NULL,'2026-11-23 16:19:50.490','2026-11-23 16:19:50.490');
/*!40000 ALTER TABLE `seasons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `series`
--

DROP TABLE IF EXISTS `series`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `series` (
  `id` varchar(191) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `poster` varchar(500) DEFAULT NULL,
  `backdrop` varchar(500) DEFAULT NULL,
  `trailer_url` varchar(500) DEFAULT NULL,
  `release_year` int(11) DEFAULT NULL,
  `rating` decimal(3,1) DEFAULT 0.0,
  `status` enum('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'PUBLISHED',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `series_slug_key` (`slug`),
  KEY `series_slug_idx` (`slug`),
  KEY `series_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `series`
--

LOCK TABLES `series` WRITE;
/*!40000 ALTER TABLE `series` DISABLE KEYS */;
INSERT INTO `series` VALUES
('7bf21baa-d3ed-4d4e-bffc-39f95fda3f16','Karagar: Cell 501','karagar-cell-501','In a high-security prison, a man mysteriously appears locked in Cell 501, which has been abandoned for fifty years. He claims he cannot speak Bengali and doesn\'t belong to this era.','https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1600&auto=format&fit=crop&q=80','https://www.youtube.com/watch?v=eBGIQ7ZuuiU',2023,9.2,'PUBLISHED','2026-11-23 16:19:50.476','2026-11-23 16:19:50.476'),
('b2412dd9-58c5-4fdd-9279-54be9659e199','Stranger Anomalies','stranger-anomalies','When a young boy vanishes into thin air, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.','https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80','https://www.youtube.com/watch?v=b9EkMc79ZSU',2024,8.7,'PUBLISHED','2026-11-23 16:19:50.446','2026-11-23 16:19:50.446');
/*!40000 ALTER TABLE `series` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `series_genres`
--

DROP TABLE IF EXISTS `series_genres`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `series_genres` (
  `series_id` varchar(191) NOT NULL,
  `genre_id` int(11) NOT NULL,
  PRIMARY KEY (`series_id`,`genre_id`),
  KEY `series_genres_genre_id_idx` (`genre_id`),
  CONSTRAINT `series_genres_genre_id_fkey` FOREIGN KEY (`genre_id`) REFERENCES `genres` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `series_genres_series_id_fkey` FOREIGN KEY (`series_id`) REFERENCES `series` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `series_genres`
--

LOCK TABLES `series_genres` WRITE;
/*!40000 ALTER TABLE `series_genres` DISABLE KEYS */;
INSERT INTO `series_genres` VALUES
('7bf21baa-d3ed-4d4e-bffc-39f95fda3f16',5),
('7bf21baa-d3ed-4d4e-bffc-39f95fda3f16',7),
('7bf21baa-d3ed-4d4e-bffc-39f95fda3f16',9),
('b2412dd9-58c5-4fdd-9279-54be9659e199',3),
('b2412dd9-58c5-4fdd-9279-54be9659e199',4),
('b2412dd9-58c5-4fdd-9279-54be9659e199',5);
/*!40000 ALTER TABLE `series_genres` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subtitles`
--

DROP TABLE IF EXISTS `subtitles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `subtitles` (
  `id` varchar(191) NOT NULL,
  `content_type` enum('MOVIE','SERIES') NOT NULL,
  `movie_id` varchar(191) DEFAULT NULL,
  `episode_id` varchar(191) DEFAULT NULL,
  `language` varchar(50) NOT NULL,
  `subtitle_url` varchar(1000) NOT NULL,
  `format` varchar(50) NOT NULL DEFAULT 'VTT',
  PRIMARY KEY (`id`),
  KEY `subtitles_movie_id_idx` (`movie_id`),
  KEY `subtitles_episode_id_idx` (`episode_id`),
  CONSTRAINT `subtitles_episode_id_fkey` FOREIGN KEY (`episode_id`) REFERENCES `episodes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `subtitles_movie_id_fkey` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subtitles`
--

LOCK TABLES `subtitles` WRITE;
/*!40000 ALTER TABLE `subtitles` DISABLE KEYS */;
INSERT INTO `subtitles` VALUES
('3232be08-7e62-49ec-9932-aa29e29c48f8','MOVIE','d8b13128-82f7-4c76-ab99-200c5c7b0d15',NULL,'English','https://raw.githubusercontent.com/brenopolanski/html5-video-webvtt-example/master/subtitles/subtitles-en.vtt','VTT'),
('76634a2b-39e3-4420-bd6a-1c7437173347','MOVIE','c02b7002-5677-46ce-99a2-95c72c6e8c10',NULL,'English','https://raw.githubusercontent.com/brenopolanski/html5-video-webvtt-example/master/subtitles/subtitles-en.vtt','VTT'),
('978fb45b-2723-43db-b5f8-70f8975e413e','MOVIE','53446497-1fb5-46ef-8f3f-9d617049598f',NULL,'English','https://raw.githubusercontent.com/brenopolanski/html5-video-webvtt-example/master/subtitles/subtitles-en.vtt','VTT');
/*!40000 ALTER TABLE `subtitles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_settings`
--

DROP TABLE IF EXISTS `user_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_settings` (
  `id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `autoplay` tinyint(1) NOT NULL DEFAULT 1,
  `preferred_quality` varchar(191) NOT NULL DEFAULT '1080p',
  `preferred_language` varchar(191) NOT NULL DEFAULT 'English',
  `subtitle_language` varchar(191) DEFAULT 'English',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_settings_user_id_key` (`user_id`),
  CONSTRAINT `user_settings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_settings`
--

LOCK TABLES `user_settings` WRITE;
/*!40000 ALTER TABLE `user_settings` DISABLE KEYS */;
INSERT INTO `user_settings` VALUES
('9e9d6f0e-f869-4b14-9584-ab7f49061404','67998225-701c-41f0-b01e-18443b3e9281',1,'1080p','English','English');
/*!40000 ALTER TABLE `user_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `avatar` varchar(500) DEFAULT NULL,
  `role` enum('SUPER_ADMIN','ADMIN','CONTENT_MANAGER','MODERATOR','USER') NOT NULL DEFAULT 'USER',
  `status` varchar(191) NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
('54fb7ac7-0d90-412f-91be-66c2a447ed2a','ScreenBox Admin','admin@screenbox.com','$2a$10$5tY/rLfnItr/P2hktkv.S.7uv5WNsO9lwCXC5P3PVOj5DH29Y2zdy','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80','SUPER_ADMIN','ACTIVE','2026-11-23 16:19:50.277','2026-11-23 16:19:50.277'),
('67998225-701c-41f0-b01e-18443b3e9281','Tariqul Islam','user@screenbox.com','$2a$10$iEB9LAyNZnhoxQJ39TlpgeFCqbhZhDH9mpJn7IMDuwyNo33xtSg6q','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80','USER','ACTIVE','2026-11-23 16:19:50.282','2026-11-23 16:19:50.282');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `video_sources`
--

DROP TABLE IF EXISTS `video_sources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `video_sources` (
  `id` varchar(191) NOT NULL,
  `content_type` enum('MOVIE','SERIES') NOT NULL,
  `movie_id` varchar(191) DEFAULT NULL,
  `episode_id` varchar(191) DEFAULT NULL,
  `source_name` varchar(100) NOT NULL,
  `source_url` varchar(1000) NOT NULL,
  `quality` varchar(50) DEFAULT '1080p',
  `format` varchar(50) NOT NULL DEFAULT 'HLS',
  `status` varchar(50) NOT NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (`id`),
  KEY `video_sources_movie_id_idx` (`movie_id`),
  KEY `video_sources_episode_id_idx` (`episode_id`),
  CONSTRAINT `video_sources_episode_id_fkey` FOREIGN KEY (`episode_id`) REFERENCES `episodes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `video_sources_movie_id_fkey` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `video_sources`
--

LOCK TABLES `video_sources` WRITE;
/*!40000 ALTER TABLE `video_sources` DISABLE KEYS */;
INSERT INTO `video_sources` VALUES
('014a5364-5480-4050-9dbd-cc3dc7c9efb5','MOVIE','d8b13128-82f7-4c76-ab99-200c5c7b0d15',NULL,'BDIX CDN 1 (HLS)','https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8','1080p','HLS','ACTIVE'),
('223d7de3-6f4a-4aee-8c68-a4e763e75081','MOVIE','ca4c0bdb-2d20-46ab-a719-d61d87098000',NULL,'Premium 4K Stream','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4','1080p','MP4','ACTIVE'),
('27fe8ebb-5fa7-44d6-9d36-95e7ef3c5f3c','SERIES',NULL,'07ae4b9c-02af-448d-918e-515775f0b777','Standard HLS','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4','1080p','HLS','ACTIVE'),
('38c590f4-ad76-4ca8-a338-c5f01b4307e6','MOVIE','c02b7002-5677-46ce-99a2-95c72c6e8c10',NULL,'Dhaka BDIX Server (HLS)','https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8','1080p','HLS','ACTIVE'),
('8fb93d63-b6e1-4426-9ef0-10a022ea5505','SERIES',NULL,'c93e90ad-0d87-46ea-a8ee-231d9828628e','Standard HLS','https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8','1080p','HLS','ACTIVE'),
('a634d4e9-53c7-42a1-9d1d-4f870ab7e222','MOVIE','53446497-1fb5-46ef-8f3f-9d617049598f',NULL,'BDIX Fast Server (HLS)','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4','1080p','MP4','ACTIVE'),
('d290a151-0eb4-46c6-a965-316c7e6d9db6','MOVIE','d8b13128-82f7-4c76-ab99-200c5c7b0d15',NULL,'Backup Stream (MP4)','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4','720p','MP4','ACTIVE'),
('f1c10f71-7c4d-4284-8a2f-79e1713d278c','SERIES',NULL,'415e9e5c-7bd7-4f36-81f7-6255f19ba15c','Standard HLS','https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8','1080p','HLS','ACTIVE');
/*!40000 ALTER TABLE `video_sources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `watch_history`
--

DROP TABLE IF EXISTS `watch_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `watch_history` (
  `id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `content_type` enum('MOVIE','SERIES') NOT NULL,
  `content_id` varchar(191) NOT NULL,
  `episode_id` varchar(191) DEFAULT NULL,
  `progress_seconds` int(11) NOT NULL DEFAULT 0,
  `duration_seconds` int(11) NOT NULL DEFAULT 0,
  `last_watched_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `watch_history_user_id_content_id_episode_id_key` (`user_id`,`content_id`,`episode_id`),
  KEY `watch_history_user_id_idx` (`user_id`),
  KEY `watch_history_last_watched_at_idx` (`last_watched_at`),
  CONSTRAINT `watch_history_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `watch_history`
--

LOCK TABLES `watch_history` WRITE;
/*!40000 ALTER TABLE `watch_history` DISABLE KEYS */;
INSERT INTO `watch_history` VALUES
('04215516-b636-4b73-ba31-d32ee2e90c65','67998225-701c-41f0-b01e-18443b3e9281','MOVIE','53446497-1fb5-46ef-8f3f-9d617049598f','',1250,8880,'2026-11-23 16:19:50.503');
/*!40000 ALTER TABLE `watch_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `watchlists`
--

DROP TABLE IF EXISTS `watchlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `watchlists` (
  `id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `content_type` enum('MOVIE','SERIES') NOT NULL,
  `content_id` varchar(191) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `watchlists_user_id_content_id_key` (`user_id`,`content_id`),
  KEY `watchlists_user_id_idx` (`user_id`),
  CONSTRAINT `watchlists_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `watchlists`
--

LOCK TABLES `watchlists` WRITE;
/*!40000 ALTER TABLE `watchlists` DISABLE KEYS */;
INSERT INTO `watchlists` VALUES
('c220dfb7-4d98-403e-a500-be477c302491','67998225-701c-41f0-b01e-18443b3e9281','MOVIE','53446497-1fb5-46ef-8f3f-9d617049598f','2026-11-23 16:19:50.499');
/*!40000 ALTER TABLE `watchlists` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-23 22:49:39
