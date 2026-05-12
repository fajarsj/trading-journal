-- AlterTable
ALTER TABLE `dailychecklist` ADD COLUMN `acknowledgedRules` JSON NULL,
    ADD COLUMN `marketRegime` VARCHAR(191) NULL,
    ADD COLUMN `marketRegimeSetAt` DATETIME(3) NULL,
    ADD COLUMN `rulesAcknowledged` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `rulesAcknowledgedAt` DATETIME(3) NULL;
