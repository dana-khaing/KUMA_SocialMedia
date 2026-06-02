-- Add media metadata for direct messages.

ALTER TABLE `Message`
ADD COLUMN `kind` ENUM('TEXT', 'AUDIO', 'IMAGE') NOT NULL DEFAULT 'TEXT',
ADD COLUMN `audioUrl` VARCHAR(191) NULL,
ADD COLUMN `audioDurationMs` INTEGER NULL,
ADD COLUMN `imageUrl` VARCHAR(191) NULL;
