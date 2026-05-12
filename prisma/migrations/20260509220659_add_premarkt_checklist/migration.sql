-- CreateTable
CREATE TABLE `ChecklistTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChecklistItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `templateId` INTEGER NOT NULL,
    `section` VARCHAR(191) NOT NULL,
    `sectionLabel` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NULL,
    `isCritical` BOOLEAN NOT NULL DEFAULT false,
    `hasInput` BOOLEAN NOT NULL DEFAULT false,
    `inputPlaceholder` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DailyChecklist` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `isReady` BOOLEAN NOT NULL DEFAULT false,
    `totalItems` INTEGER NOT NULL,
    `completedItems` INTEGER NOT NULL DEFAULT 0,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DailyChecklist_date_key`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DailyChecklistCompletion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dailyChecklistId` INTEGER NOT NULL,
    `checklistItemId` INTEGER NOT NULL,
    `isChecked` BOOLEAN NOT NULL DEFAULT false,
    `inputValue` VARCHAR(191) NULL,
    `checkedAt` DATETIME(3) NULL,

    UNIQUE INDEX `DailyChecklistCompletion_dailyChecklistId_checklistItemId_key`(`dailyChecklistId`, `checklistItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ChecklistItem` ADD CONSTRAINT `ChecklistItem_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `ChecklistTemplate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DailyChecklistCompletion` ADD CONSTRAINT `DailyChecklistCompletion_dailyChecklistId_fkey` FOREIGN KEY (`dailyChecklistId`) REFERENCES `DailyChecklist`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DailyChecklistCompletion` ADD CONSTRAINT `DailyChecklistCompletion_checklistItemId_fkey` FOREIGN KEY (`checklistItemId`) REFERENCES `ChecklistItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
