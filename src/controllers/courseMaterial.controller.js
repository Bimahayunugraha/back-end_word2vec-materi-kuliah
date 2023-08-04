const response = require("../utils/response");
const prisma = require("../configs/prisma");
const fs = require("fs-extra");
const path = require("path");

// Fungsi untuk mendapatkan semua data materi kuliah
const getAllListsFileCourseMaterial = async (req, res) => {
  try {
    // Query untuk menghitung total data materi kuliah
    const totalRows = await prisma.course_material.count({ where: { id_user: req.userId } });

    // Query untuk mendapatkan semua data materi kuliah
    await prisma.course_material
      .findMany({ where: { id_user: req.userId }, orderBy: { createdAt: "desc" } })
      .then(async (result) => {
        response(
          200,
          result,
          { totalRows: totalRows },
          "Berhasil mendapatkan data materi kuliah",
          res
        );
      })
      // Jika terjadi kesalahan saat mendapatkan data materi kuliah
      .catch((err) => {
        throw {
          code: 400,
          message: "Terjadi kesalahan saat mendapatkan data materi kuliah",
          detailError: err.message,
        };
      })
      // Jika sudah selesai, maka tutup koneksi ke database
      .finally(async () => {
        await prisma.$disconnect();
      });
  } catch (err) {
    return res.status(400).json({
      message: err.message,
      detailError: err.detailError,
    });
  }
};

// Fungsi untuk mengubah data materi kuliah
const updateInformationCourseMaterial = async (req, res) => {
  try {
    const { book_title } = req.body;
    const { id } = req.params;

    // Query untuk mendapatkan data materi kuliah berdasarkan id
    const course_material = await prisma.course_material.findUnique({
      where: {
        id: id,
      },
    });

    // Jika data materi kuliah tidak ditemukan
    if (!course_material)
      return res.status(404).json({ msg: "Data materi kuliah tidak ditemukan" });

    // Query untuk mengubah data materi kuliah
    await prisma.course_material
      .update({
        where: {
          id: id,
        },
        data: {
          book_title: book_title,
        },
      })
      // Jika data materi kuliah berhasil diubah, mengirim response ke klien
      .then((result) => {
        response(200, result, {}, "Materi kuliah berhasil di update", res);
      })
      // Jika terjadi kesalahan saat mengubah data materi kuliah
      .catch((error) => {
        throw {
          code: 500,
          message: "Terjadi kesalahan saat mengubah data materi kuliah",
          detailError: error.message,
        };
      })
      // Jika sudah selesai, maka tutup koneksi ke database
      .finally(async () => {
        await prisma.$disconnect();
      });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      detailError: error.detailError,
    });
  }
};

// Fungsi untuk mendownload file materi kuliah
const downloadCourseMaterialFile = async (req, res) => {
  try {
    const { id } = req.params;

    // Query untuk mendapatkan data materi kuliah berdasarkan id
    await prisma.course_material
      .findUnique({
        where: {
          id: id,
        },
      })
      .then((result) => {
        let file = result.file_path;

        // Deklarasi variabel untuk menetapkan nama file
        let filename = path.basename(file);

        // Deklarasi variabel untuk menetapkan tipe file
        let mimetype = path.extname(file).toLocaleLowerCase();

        // Mengatur header response
        res.setHeader("Content-disposition", "attachment; filename=" + filename);
        res.setHeader("Content-type", mimetype);

        // Membaca isi file corpus
        let filestream = fs.createReadStream(file);

        // Mengirim isi file corpus ke klien
        filestream.pipe(res);
      }) // Jika terjadi error, maka kirim response ke klien
      .catch((error) => {
        throw {
          code: 500,
          message: "Terjadi kesalahan saat mendownload file corpus",
          detailError: error.message,
        };
      })
      // Jika sudah selesai, maka tutup koneksi ke database
      .finally(async () => {
        await prisma.$disconnect();
      });
  } catch (error) {
    res.status(400).send("Eror saat mendownload materi kuliah. Silahkan coba lagi.");
  }
};

module.exports = {
  getAllListsFileCourseMaterial,
  downloadCourseMaterialFile,
  updateInformationCourseMaterial,
};
