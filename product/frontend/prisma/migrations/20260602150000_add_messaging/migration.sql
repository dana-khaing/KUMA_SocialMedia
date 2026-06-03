-- Add direct messaging conversations and messages.

CREATE TABLE `Conversation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `directKey` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Conversation_directKey_key`(`directKey`),
    INDEX `Conversation_updatedAt_idx`(`updatedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ConversationParticipant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `conversationId` INTEGER NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `lastReadAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ConversationParticipant_conversation_user_key`(`conversationId`, `userId`),
    INDEX `ConversationParticipant_userId_idx`(`userId`),
    INDEX `ConversationParticipant_conversationId_idx`(`conversationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Message` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `conversationId` INTEGER NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Message_conversation_createdAt_idx`(`conversationId`, `createdAt`),
    INDEX `Message_senderId_idx`(`senderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `ConversationParticipant`
ADD CONSTRAINT `ConversationParticipant_conversationId_fkey`
FOREIGN KEY (`conversationId`) REFERENCES `Conversation`(`id`)
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ConversationParticipant`
ADD CONSTRAINT `ConversationParticipant_userId_fkey`
FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Message`
ADD CONSTRAINT `Message_conversationId_fkey`
FOREIGN KEY (`conversationId`) REFERENCES `Conversation`(`id`)
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Message`
ADD CONSTRAINT `Message_senderId_fkey`
FOREIGN KEY (`senderId`) REFERENCES `User`(`id`)
ON DELETE CASCADE ON UPDATE CASCADE;
