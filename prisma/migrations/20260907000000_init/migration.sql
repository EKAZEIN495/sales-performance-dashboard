CREATE TABLE `Store` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `nama` VARCHAR(191) NOT NULL,
  `kode` VARCHAR(191) NOT NULL,
  UNIQUE INDEX `Store_kode_key`(`kode`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Sales` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `nama` VARCHAR(191) NOT NULL,
  `storeId` INTEGER NOT NULL,
  `aktif` BOOLEAN NOT NULL DEFAULT true,
  INDEX `Sales_storeId_aktif_idx`(`storeId`, `aktif`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Target` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `salesId` INTEGER NOT NULL,
  `kategori` ENUM('DEVICE', 'ACC_IOT', 'REPAIR_CONTRACT', 'CARRIER', 'CE') NOT NULL,
  `bulan` INTEGER NOT NULL,
  `tahun` INTEGER NOT NULL,
  `nilai` DECIMAL(15, 2) NOT NULL,
  INDEX `Target_bulan_tahun_idx`(`bulan`, `tahun`),
  UNIQUE INDEX `Target_salesId_kategori_bulan_tahun_key`(`salesId`, `kategori`, `bulan`, `tahun`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `DailyEntry` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `salesId` INTEGER NOT NULL,
  `kategori` ENUM('DEVICE', 'ACC_IOT', 'REPAIR_CONTRACT', 'CARRIER', 'CE') NOT NULL,
  `tanggal` DATETIME(3) NOT NULL,
  `nilaiMtd` DECIMAL(15, 2) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `DailyEntry_salesId_kategori_tanggal_idx`(`salesId`, `kategori`, `tanggal`),
  UNIQUE INDEX `DailyEntry_salesId_kategori_tanggal_key`(`salesId`, `kategori`, `tanggal`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Sales` ADD CONSTRAINT `Sales_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Target` ADD CONSTRAINT `Target_salesId_fkey` FOREIGN KEY (`salesId`) REFERENCES `Sales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `DailyEntry` ADD CONSTRAINT `DailyEntry_salesId_fkey` FOREIGN KEY (`salesId`) REFERENCES `Sales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
