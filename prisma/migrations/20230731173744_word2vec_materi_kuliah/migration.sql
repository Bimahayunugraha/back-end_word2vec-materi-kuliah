-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `id_role` VARCHAR(191) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `username` VARCHAR(30) NOT NULL,
    `phone` VARCHAR(13) NOT NULL,
    `email` VARCHAR(50) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` VARCHAR(191) NOT NULL,
    `role_name` VARCHAR(10) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `roles_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profile_images` (
    `id` VARCHAR(191) NOT NULL,
    `id_user` VARCHAR(191) NOT NULL,
    `image_name` VARCHAR(191) NOT NULL,
    `image_path` VARCHAR(191) NOT NULL,
    `image_size` INTEGER NOT NULL,
    `image_url` VARCHAR(191) NOT NULL,
    `image_mimetype` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `profile_images_id_key`(`id`),
    UNIQUE INDEX `profile_images_id_user_key`(`id_user`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_reset_tokens` (
    `id_user` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `used` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `password_reset_tokens_id_user_key`(`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `corpus` (
    `id` VARCHAR(191) NOT NULL,
    `id_user` VARCHAR(191) NOT NULL,
    `course` VARCHAR(100) NOT NULL,
    `book_title` VARCHAR(30) NOT NULL,
    `in_name` VARCHAR(191) NOT NULL,
    `in_file_path` VARCHAR(191) NOT NULL,
    `in_file_mimetype` VARCHAR(191) NOT NULL,
    `in_file_size` INTEGER NOT NULL,
    `in_file_url` VARCHAR(191) NOT NULL,
    `out_name` VARCHAR(191) NOT NULL,
    `out_file_path` VARCHAR(191) NOT NULL,
    `out_file_mimetype` VARCHAR(191) NOT NULL,
    `out_file_size` INTEGER NOT NULL,
    `out_file_url` VARCHAR(191) NOT NULL,
    `conversion_type` VARCHAR(10) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `corpus_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_material` (
    `id` VARCHAR(191) NOT NULL,
    `id_user` VARCHAR(191) NOT NULL,
    `course` VARCHAR(100) NOT NULL,
    `book_title` VARCHAR(30) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `file_path` VARCHAR(191) NOT NULL,
    `file_mimetype` VARCHAR(191) NOT NULL,
    `file_size` INTEGER NOT NULL,
    `file_url` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `course_material_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `word2vec` (
    `id` VARCHAR(191) NOT NULL,
    `id_user` VARCHAR(191) NOT NULL,
    `course` VARCHAR(100) NOT NULL,
    `book_title` VARCHAR(30) NOT NULL,
    `in_name` VARCHAR(191) NOT NULL,
    `in_file_path` VARCHAR(191) NOT NULL,
    `in_file_mimetype` VARCHAR(191) NOT NULL,
    `in_file_size` INTEGER NOT NULL,
    `in_file_url` VARCHAR(191) NOT NULL,
    `out_name` VARCHAR(191) NOT NULL,
    `out_file_path` VARCHAR(191) NOT NULL,
    `out_file_mimetype` VARCHAR(191) NOT NULL,
    `out_file_size` INTEGER NOT NULL,
    `out_file_url` VARCHAR(191) NOT NULL,
    `conversion_type` VARCHAR(10) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `word2vec_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `similarity` (
    `id` VARCHAR(191) NOT NULL,
    `id_user` VARCHAR(191) NOT NULL,
    `student_nim` VARCHAR(11) NOT NULL,
    `student_class` VARCHAR(10) NOT NULL,
    `exam_name` VARCHAR(100) NOT NULL,
    `question_number` INTEGER NOT NULL,
    `student_answer` TEXT NOT NULL,
    `total_score` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `similarity_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_id_role_fkey` FOREIGN KEY (`id_role`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profile_images` ADD CONSTRAINT `profile_images_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `password_reset_tokens` ADD CONSTRAINT `password_reset_tokens_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `corpus` ADD CONSTRAINT `corpus_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_material` ADD CONSTRAINT `course_material_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `word2vec` ADD CONSTRAINT `word2vec_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `similarity` ADD CONSTRAINT `similarity_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
