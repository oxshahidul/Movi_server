-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `avatar` VARCHAR(500) NULL,
    `role` ENUM('SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER', 'MODERATOR', 'USER') NOT NULL DEFAULT 'USER',
    `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(255) NULL,

    UNIQUE INDEX `roles_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `movies` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `poster` VARCHAR(500) NULL,
    `backdrop` VARCHAR(500) NULL,
    `trailer_url` VARCHAR(500) NULL,
    `release_year` INTEGER NULL,
    `runtime` INTEGER NULL,
    `rating` DECIMAL(3, 1) NULL DEFAULT 0.0,
    `language` VARCHAR(50) NULL DEFAULT 'English',
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'PUBLISHED',
    `published_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `movies_slug_key`(`slug`),
    INDEX `movies_slug_idx`(`slug`),
    INDEX `movies_release_year_idx`(`release_year`),
    INDEX `movies_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `series` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `poster` VARCHAR(500) NULL,
    `backdrop` VARCHAR(500) NULL,
    `trailer_url` VARCHAR(500) NULL,
    `release_year` INTEGER NULL,
    `rating` DECIMAL(3, 1) NULL DEFAULT 0.0,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'PUBLISHED',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `series_slug_key`(`slug`),
    INDEX `series_slug_idx`(`slug`),
    INDEX `series_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seasons` (
    `id` VARCHAR(191) NOT NULL,
    `series_id` VARCHAR(191) NOT NULL,
    `season_number` INTEGER NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `poster` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `seasons_series_id_idx`(`series_id`),
    UNIQUE INDEX `seasons_series_id_season_number_key`(`series_id`, `season_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `episodes` (
    `id` VARCHAR(191) NOT NULL,
    `season_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `episode_number` INTEGER NOT NULL,
    `description` TEXT NULL,
    `thumbnail` VARCHAR(500) NULL,
    `runtime` INTEGER NULL,
    `release_date` DATETIME(3) NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'PUBLISHED',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `episodes_slug_key`(`slug`),
    INDEX `episodes_season_id_idx`(`season_id`),
    UNIQUE INDEX `episodes_season_id_episode_number_key`(`season_id`, `episode_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `genres` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `genres_name_key`(`name`),
    UNIQUE INDEX `genres_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `movie_genres` (
    `movie_id` VARCHAR(191) NOT NULL,
    `genre_id` INTEGER NOT NULL,

    INDEX `movie_genres_genre_id_idx`(`genre_id`),
    PRIMARY KEY (`movie_id`, `genre_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `series_genres` (
    `series_id` VARCHAR(191) NOT NULL,
    `genre_id` INTEGER NOT NULL,

    INDEX `series_genres_genre_id_idx`(`genre_id`),
    PRIMARY KEY (`series_id`, `genre_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cast` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `image` VARCHAR(500) NULL,
    `biography` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `content_cast` (
    `id` VARCHAR(191) NOT NULL,
    `cast_id` VARCHAR(191) NOT NULL,
    `movie_id` VARCHAR(191) NULL,
    `series_id` VARCHAR(191) NULL,
    `character_name` VARCHAR(255) NULL,

    INDEX `content_cast_cast_id_idx`(`cast_id`),
    INDEX `content_cast_movie_id_idx`(`movie_id`),
    INDEX `content_cast_series_id_idx`(`series_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `video_sources` (
    `id` VARCHAR(191) NOT NULL,
    `content_type` ENUM('MOVIE', 'SERIES') NOT NULL,
    `movie_id` VARCHAR(191) NULL,
    `episode_id` VARCHAR(191) NULL,
    `source_name` VARCHAR(100) NOT NULL,
    `source_url` VARCHAR(1000) NOT NULL,
    `quality` VARCHAR(50) NULL DEFAULT '1080p',
    `format` VARCHAR(50) NOT NULL DEFAULT 'HLS',
    `status` VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',

    INDEX `video_sources_movie_id_idx`(`movie_id`),
    INDEX `video_sources_episode_id_idx`(`episode_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subtitles` (
    `id` VARCHAR(191) NOT NULL,
    `content_type` ENUM('MOVIE', 'SERIES') NOT NULL,
    `movie_id` VARCHAR(191) NULL,
    `episode_id` VARCHAR(191) NULL,
    `language` VARCHAR(50) NOT NULL,
    `subtitle_url` VARCHAR(1000) NOT NULL,
    `format` VARCHAR(50) NOT NULL DEFAULT 'VTT',

    INDEX `subtitles_movie_id_idx`(`movie_id`),
    INDEX `subtitles_episode_id_idx`(`episode_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `watch_history` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `content_type` ENUM('MOVIE', 'SERIES') NOT NULL,
    `content_id` VARCHAR(191) NOT NULL,
    `episode_id` VARCHAR(191) NULL,
    `progress_seconds` INTEGER NOT NULL DEFAULT 0,
    `duration_seconds` INTEGER NOT NULL DEFAULT 0,
    `last_watched_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `watch_history_user_id_idx`(`user_id`),
    INDEX `watch_history_last_watched_at_idx`(`last_watched_at`),
    UNIQUE INDEX `watch_history_user_id_content_id_episode_id_key`(`user_id`, `content_id`, `episode_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `watchlists` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `content_type` ENUM('MOVIE', 'SERIES') NOT NULL,
    `content_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `watchlists_user_id_idx`(`user_id`),
    UNIQUE INDEX `watchlists_user_id_content_id_key`(`user_id`, `content_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favorites` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `content_type` ENUM('MOVIE', 'SERIES') NOT NULL,
    `content_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `favorites_user_id_idx`(`user_id`),
    UNIQUE INDEX `favorites_user_id_content_id_key`(`user_id`, `content_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ratings` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `content_type` ENUM('MOVIE', 'SERIES') NOT NULL,
    `content_id` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ratings_user_id_idx`(`user_id`),
    UNIQUE INDEX `ratings_user_id_content_id_key`(`user_id`, `content_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_settings` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `autoplay` BOOLEAN NOT NULL DEFAULT true,
    `preferred_quality` VARCHAR(191) NOT NULL DEFAULT '1080p',
    `preferred_language` VARCHAR(191) NOT NULL DEFAULT 'English',
    `subtitle_language` VARCHAR(191) NULL DEFAULT 'English',

    UNIQUE INDEX `user_settings_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `action` VARCHAR(100) NOT NULL,
    `entity_type` VARCHAR(100) NOT NULL,
    `entity_id` VARCHAR(100) NULL,
    `details` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_user_id_idx`(`user_id`),
    INDEX `audit_logs_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `seasons` ADD CONSTRAINT `seasons_series_id_fkey` FOREIGN KEY (`series_id`) REFERENCES `series`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `episodes` ADD CONSTRAINT `episodes_season_id_fkey` FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movie_genres` ADD CONSTRAINT `movie_genres_movie_id_fkey` FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movie_genres` ADD CONSTRAINT `movie_genres_genre_id_fkey` FOREIGN KEY (`genre_id`) REFERENCES `genres`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `series_genres` ADD CONSTRAINT `series_genres_series_id_fkey` FOREIGN KEY (`series_id`) REFERENCES `series`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `series_genres` ADD CONSTRAINT `series_genres_genre_id_fkey` FOREIGN KEY (`genre_id`) REFERENCES `genres`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `content_cast` ADD CONSTRAINT `content_cast_cast_id_fkey` FOREIGN KEY (`cast_id`) REFERENCES `cast`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `content_cast` ADD CONSTRAINT `content_cast_movie_id_fkey` FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `content_cast` ADD CONSTRAINT `content_cast_series_id_fkey` FOREIGN KEY (`series_id`) REFERENCES `series`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `video_sources` ADD CONSTRAINT `video_sources_movie_id_fkey` FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `video_sources` ADD CONSTRAINT `video_sources_episode_id_fkey` FOREIGN KEY (`episode_id`) REFERENCES `episodes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subtitles` ADD CONSTRAINT `subtitles_movie_id_fkey` FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subtitles` ADD CONSTRAINT `subtitles_episode_id_fkey` FOREIGN KEY (`episode_id`) REFERENCES `episodes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `watch_history` ADD CONSTRAINT `watch_history_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `watchlists` ADD CONSTRAINT `watchlists_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ratings` ADD CONSTRAINT `ratings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_settings` ADD CONSTRAINT `user_settings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
