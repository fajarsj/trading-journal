-- CreateTable
CREATE TABLE `UserSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `capitalTotal` DECIMAL(15, 2) NOT NULL,
    `maxRiskPercentPerTrade` DECIMAL(5, 2) NOT NULL,
    `maxOpenPositions` INTEGER NOT NULL,
    `defaultBrokerageFee` DECIMAL(5, 4) NOT NULL,
    `defaultSellFee` DECIMAL(5, 4) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Trade` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `symbol` VARCHAR(10) NOT NULL,
    `stockName` VARCHAR(191) NULL,
    `direction` ENUM('LONG', 'SHORT') NOT NULL,
    `status` ENUM('OPEN', 'CLOSED', 'CANCELLED') NOT NULL DEFAULT 'OPEN',
    `entryDate` DATETIME(3) NOT NULL,
    `exitDate` DATETIME(3) NULL,
    `entryPrice` DECIMAL(12, 2) NOT NULL,
    `exitPrice` DECIMAL(12, 2) NULL,
    `lotSize` INTEGER NOT NULL,
    `shares` INTEGER NOT NULL,
    `entryValue` DECIMAL(15, 2) NOT NULL,
    `exitValue` DECIMAL(15, 2) NULL,
    `brokerageFeeEntry` DECIMAL(12, 2) NOT NULL,
    `brokerageFeeExit` DECIMAL(12, 2) NULL,
    `stopLossPrice` DECIMAL(12, 2) NULL,
    `takeProfitPrice` DECIMAL(12, 2) NULL,
    `riskAmount` DECIMAL(12, 2) NULL,
    `riskPercent` DECIMAL(5, 2) NULL,
    `rewardRiskRatio` DECIMAL(5, 2) NULL,
    `realizedPnL` DECIMAL(12, 2) NULL,
    `realizedPnLPercent` DECIMAL(7, 4) NULL,
    `strategy` VARCHAR(191) NULL,
    `sector` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `exitReason` ENUM('TAKE_PROFIT', 'STOP_LOSS', 'MANUAL', 'EXPIRED') NULL,
    `emotionEntry` ENUM('CONFIDENT', 'UNCERTAIN', 'FOMO', 'DISCIPLINED') NULL,
    `emotionExit` ENUM('SATISFIED', 'REGRET', 'NEUTRAL', 'FEAR') NULL,
    `tags` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JournalEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `marketCondition` ENUM('BULLISH', 'BEARISH', 'SIDEWAYS', 'VOLATILE') NOT NULL,
    `body` TEXT NOT NULL,
    `mood` ENUM('GREAT', 'GOOD', 'NEUTRAL', 'BAD', 'TERRIBLE') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `JournalEntry_date_key`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
