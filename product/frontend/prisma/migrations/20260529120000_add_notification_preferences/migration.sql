-- Add notification preferences and indexes used by the notification center.

CREATE TABLE `NotificationPreference` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `posts` BOOLEAN NOT NULL DEFAULT true,
    `stories` BOOLEAN NOT NULL DEFAULT true,
    `comments` BOOLEAN NOT NULL DEFAULT true,
    `reactions` BOOLEAN NOT NULL DEFAULT true,
    `follows` BOOLEAN NOT NULL DEFAULT true,
    `newUsers` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `NotificationPreference_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `Notification_receiver_read_createdAt_idx` ON `Notification`(`receiverId`, `read`, `createdAt`);
CREATE INDEX `Notification_receiver_createdAt_idx` ON `Notification`(`receiverId`, `createdAt`);

ALTER TABLE `NotificationPreference`
ADD CONSTRAINT `NotificationPreference_userId_fkey`
FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
ON DELETE CASCADE ON UPDATE CASCADE;
