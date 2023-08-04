const w2v = require("word2vec");
const response = require("../utils/response");
const fs = require("fs-extra");
const fsb = require("fs");
const path = require("path");
const prisma = require("../configs/prisma");
const uniqueId = require("../utils/generateUniqueId");

let uploadPath = "public/uploads/word2vec";
let convertedPath = "public/converteds/word2vec";

// Fungsi untuk mendapatkan semua data word2vec
const getAllListsFileWord2vec = async (req, res) => {
  try {
    const last_id = String(req.query.lastId) || "";
    const page = parseInt(req.query.page) || 0;
    const take = parseInt(req.query.take) || 10;
    const skip = take * page;

    // Query untuk menghitung total data word2vec
    const totalRows = await prisma.word2vec.count();

    // Fungsi untuk menghitung total halaman
    const totalPage = Math.ceil(totalRows / take);

    let result = [];

    // Jika last_id kosong
    if (last_id === "") {
      // Query untuk mendapatkan semua data word2vec
      const results = await prisma.word2vec.findMany({
        skip: skip,
        take: take,
        orderBy: {
          id: "desc",
        },
        include: {
          users: {
            select: {
              name: true,
              username: true,
              email: true,
              phone: true,
              profile_images: {
                select: {
                  image_name: true,
                  image_path: true,
                  image_size: true,
                  image_url: true,
                  image_mimetype: true,
                },
              },
            },
          },
        },
      });

      result = results;
      // Jika last_id tidak kosong
    } else {
      // Query untuk mendapatkan semua data word2vec
      const results = await prisma.word2vec.findMany({
        where: {
          id: { lt: last_id },
        },
        skip: skip,
        take: take,
        orderBy: {
          id: "desc",
        },
        include: {
          users: {
            select: {
              name: true,
              username: true,
              email: true,
              phone: true,
              profile_images: {
                select: {
                  image_name: true,
                  image_path: true,
                  image_size: true,
                  image_url: true,
                  image_mimetype: true,
                },
              },
            },
          },
        },
      });

      result = results;
    }

    // Jika berhasil mendapatkan semua data word2vec
    response(
      200,
      result,
      {
        totalRows: totalRows,
        take: take,
        page: page,
        totalPage: totalPage,
        skip: skip,
        lastId: result.length ? result[result.length - 1].id : "",
        hasMore: result.length >= take ? true : false,
      },
      "Berhasil mendapatkan semua data word2vec",
      res
    );

    // Jika terjadi kesalahan saat mendapatkan semua data word2vec
  } catch (err) {
    return res.status(400).json({
      message: "Terjadi kesalahan saat mendapatkan semua data word2vec",
      detailError: err.detailError,
    });
  }
};

// Fungsi untuk mencari semua data word2vec
const searchAllListsFileWord2vec = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const take = parseInt(req.query.take) || 10;
    const search = req.query.search_query || "";
    const skip = take * page;

    // Query untuk menghitung total data word2vec berdasarkan pencarian
    const totalRows = await prisma.word2vec.count({
      where: {
        OR: [
          {
            course: {
              contains: search,
            },
          },
          {
            book_title: {
              contains: search,
            },
          },
          {
            users: {
              name: {
                contains: search,
              },
            },
          },
        ],
      },
      orderBy: {
        users: {
          name: "asc",
        },
      },
    });

    // Fungsi untuk menghitung total halaman
    const totalPage = Math.ceil(totalRows / take);

    // Query untuk mencari semua data word2vec berdasarkan pencarian
    const word2vec = await prisma.word2vec.findMany({
      where: {
        OR: [
          {
            course: { contains: search },
          },
          {
            book_title: { contains: search },
          },
          {
            users: {
              name: {
                contains: search,
              },
            },
          },
        ],
      },

      skip: skip,
      take: take,
      orderBy: {
        users: {
          name: "asc",
        },
      },
      include: {
        users: {
          select: {
            name: true,
            username: true,
            email: true,
            phone: true,
            profile_images: {
              select: {
                image_name: true,
                image_path: true,
                image_size: true,
                image_url: true,
                image_mimetype: true,
              },
            },
          },
        },
      },
    });

    // Jika tidak menemukan data word2vec yang dicari
    if (!word2vec)
      return res.status(404).json({ msg: "Data word2vec yang dicari tidak ditemukan" });

    // Jika berhasil mendapatkan semua data word2vec berdasarkan pencarian
    response(
      200,
      word2vec,
      { totalRows: totalRows, take: take, page: page, totalPage: totalPage, skip: skip },
      "Berhasil mendapatkan semua data word2vec",
      res
    );
    // Jika terjadi kesalahan saat mendapatkan semua data word2vec berdasarkan pencarian
  } catch (err) {
    return res.status(400).json({
      message: "Terjadi kesalahan saat mendapatkan semua data word2vec",
      detailError: err.message,
    });
  }
};

// Fungsi untuk memfilter semua data word2vec
const filterAllListsFileWord2vec = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const take = parseInt(req.query.take) || 10;
    const filterDosen = req.query.dosen || "";
    const filterMataKuliah = req.query.mata_kuliah || "";
    const skip = take * page;

    // Query untuk menghitung total data word2vec berdasarkan filter
    const totalRows = await prisma.word2vec.count({
      where: {
        AND: [
          {
            course: {
              contains: filterMataKuliah,
            },
          },
          {
            users: {
              name: {
                contains: filterDosen,
              },
            },
          },
        ],
      },
      orderBy: {
        book_title: "asc",
      },
    });

    // Fungsi untuk menghitung total halaman
    const totalPage = Math.ceil(totalRows / take);

    // Query untuk memfilter semua data word2vec berdasarkan filter
    const word2vec = await prisma.word2vec.findMany({
      where: {
        AND: [
          {
            course: {
              contains: filterMataKuliah,
            },
          },
          {
            users: {
              name: {
                contains: filterDosen,
              },
            },
          },
        ],
      },
      skip: skip,
      take: take,
      orderBy: {
        book_title: "asc",
      },
      include: {
        users: {
          select: {
            name: true,
            username: true,
            email: true,
            phone: true,
            profile_images: {
              select: {
                image_name: true,
                image_path: true,
                image_size: true,
                image_url: true,
                image_mimetype: true,
              },
            },
          },
        },
      },
    });

    // Jika tidak menemukan data word2vec yang difilter
    if (!word2vec) return res.status(404).json({ msg: "Data yang difilter tidak ditemukan" });

    // Jika berhasil memfilter semua data word2vec
    response(
      200,
      word2vec,
      { totalRows: totalRows, take: take, page: page, totalPage: totalPage, skip: skip },
      "Berhasil mendapatkan semua data word2vec",
      res
    );
    // Jika terjadi kesalahan saat memfilter semua data word2vec
  } catch (err) {
    return res.status(400).json({
      message: "Terjadi kesalahan saat mendapatkan semua data word2vec",
      detailError: err.detailError,
    });
  }
};

// Fungsi untuk mendapatkan semua data word2vec berdasarkan id user
const getListsFileWord2vecByDosen = async (req, res) => {
  try {
    // Query untuk menghitung total data word2vec berdasarkan id user
    const totalRows = await prisma.word2vec.count({ where: { id_user: req.userId } });

    // Query untuk mendapatkan semua data word2vec berdasarkan id user
    await prisma.word2vec
      .findMany({
        where: {
          AND: [{ conversion_type: "word2vec" }, { id_user: req.userId }],
        },
        orderBy: {
          updatedAt: "desc",
        },
      })
      // Jika berhasil mendapatkan semua data word2vec berdasarkan id user
      .then((result) => {
        return response(
          200,
          result,
          { totalRows: totalRows },
          "Berhasil mendapatkan data word2vec",
          res
        );
      })
      // Jika terjadi kesalahan saat mendapatkan semua data word2vec berdasarkan id user
      .catch((err) => {
        throw {
          code: 400,
          message: "Terjadi kesalahan saat mendapatkan data word2vec",
          detailError: err.message,
        };
      });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      detailError: err.detailError,
    });
  }
};

// Fungsi untuk mengkonversi file korpus menjadi word2vec
const convertWord2vec = async (req, res) => {
  try {
    // Deklarasi variable file dan body
    const file = req.file;
    const { course, book_title } = req.body;

    // Cek apakah file ada atau tidak
    if (file == undefined) {
      return response(400, [], {}, "Pilih file terlebih dahulu", res);
    }

    // Deklarasi variabel untuk menetapkan ukuran file dari file yang diupload
    const fileSize = file.size;

    // Deklarasi variabel untuk menetapkan ekstensi file yang diupload
    const inExt = path.extname(file.originalname).toLowerCase();

    // Deklarasi variabel untuk menetapkan ekstensi file yang dikonversi
    const outExt = ".txt";

    // Deklarasi variabel untuk menetapkan nama file yang diupload
    const inFileName = file.originalname;

    // Deklarasi variabel untuk menetapkan nama file yang dikonversi
    const outFileName = `${book_title}-[Word2vec]` + outExt;

    // Cek apakah judul buku sudah ada atau belum
    const inUniqueWord2vec = await prisma.word2vec.findFirst({
      where: { book_title: book_title },
    });

    // Jika judul buku sudah ada, maka akan mengirimkan response 403
    if (inUniqueWord2vec) {
      return response(
        403,
        { unique: true },
        {},
        "Judul buku sudah ada!, silahkan ganti judul buku",
        res
      );
    } else {
      // Cek direktori untuk menyimpan file yang dikonversi apakah sudah ada atau belum
      /**
       * Jika belum ada, maka buat direktori baru
       * Jika sudah ada, maka lanjutkan proses
       */
      if (!fs.existsSync(convertedPath + `/${req.userId}`)) {
        fs.mkdirSync(convertedPath + `/${req.userId}`, { recursive: true });
      }

      // Deklarasi variabel untuk menetapkan path file yang telah dikonversi
      const filepath = convertedPath + `/${req.userId}/${outFileName}`;

      try {
        // Fungsi untuk mengkonversi korpus ke word2vec
        w2v.word2vec(file.path, filepath, { size: 300 }, async (error) => {
          // Cek apakah terjadi error atau tidak
          if (error) {
            res.status(500).send("Gagal mengkonversi file");
          } else {
            if (!fsb.existsSync(filepath)) {
              res.status(400).send("Direktori tidak ditemukan");
            }
            // Deklarasi variabel untuk menetapkan ukuran file yang dikonversi
            let stats = fsb.statSync(filepath);
            let fileSizeInBytes = stats.size;

            // Menyimpan data file yang telah dikonversi ke database
            prisma.word2vec
              .create({
                data: {
                  id: await uniqueId(),
                  id_user: req.userId,
                  course: course,
                  book_title: book_title,
                  in_name: inFileName,
                  in_file_path: uploadPath + `/${req.userId}/${inFileName}`,
                  in_file_mimetype: inExt,
                  in_file_size: fileSize,
                  in_file_url: `${req.protocol}://${req.get("host")}/uploads/word2vec/${
                    req.name
                  }/${course}/${req.userId}/${inFileName}`,
                  out_name: outFileName,
                  out_file_path: convertedPath + `/${req.userId}/${outFileName}`,
                  out_file_mimetype: outExt,
                  out_file_size: fileSizeInBytes,
                  out_file_url: `${req.protocol}://${req.get("host")}/word2vec/${
                    req.name
                  }/${course}/${req.userId}/${outFileName}`,
                  conversion_type: "word2vec",
                },
              })
              .then((result) => {
                response(200, result, {}, "File berhasil dikonversi", res);
              });
          }
        });
      } catch (error) {
        // Jika terjadi error, maka akan mengirimkan response 400
        return res.status(400).json({
          message: error.message,
          detailError: error.detailError,
        });
      }
    }
  } catch (error) {
    response(400, error, "Eror saat mengupload file", res);
  }
};

// Fungsi untuk mendapatkan semua data word2vec berdasarkan id user
const getFileWord2vecById = async (req, res) => {
  try {
    const { id } = req.params;

    // Query untuk menghitung total data word2vec berdasarkan id user
    const totalRows = await prisma.word2vec.count({
      where: { AND: [{ id: id }, { id_user: req.userId }] },
    });

    // Query untuk mendapatkan semua data word2vec berdasarkan id user
    const word2vec = await prisma.word2vec.findFirst({
      select: {
        id: true,
        course: true,
        book_title: true,
        in_name: true,
        in_file_path: true,
        in_file_mimetype: true,
        in_file_size: true,
        in_file_url: true,
        out_name: true,
        out_file_path: true,
        out_file_mimetype: true,
        out_file_size: true,
        out_file_url: true,
        conversion_type: true,
        users: {
          select: {
            name: true,
            username: true,
            email: true,
            phone: true,
            profile_images: {
              select: {
                image_name: true,
                image_path: true,
                image_size: true,
                image_url: true,
                image_mimetype: true,
              },
            },
          },
        },
      },
      where: {
        AND: [{ id: id }, { id_user: req.userId }],
      },
    });

    // Jika tidak menemukan data word2vec berdasarkan id user
    if (!word2vec) return res.status(404).json({ msg: "Data word2vec tidak ditemukan" });

    // Deklarasi variabel untuk menetapkan ukuran chunk
    const CHUNK_SIZE = 10000000; // 10MB

    // Deklarasi variabel untuk membaca file
    const readStream = fs.createReadStream(word2vec.out_file_path, "utf8", {
      highWaterMark: CHUNK_SIZE,
    });

    let chunks = [];

    // Deklarasi variabel untuk membaca file dengan event
    readStream.on("data", (chunk) => {
      chunks.push(chunk);
    });

    // Deklarasi variabel jika sudah selesai membaca file
    readStream.on("end", () => {
      response(
        200,
        { word2vec, content: chunks },
        { totalRows },
        "Berhasil mendapatkan data word2vec berdasarkan id",
        res
      );
    });

    // Deklarasi variabel jika terjadi error saat membaca file
    readStream.on("error", (err) => {
      res.status(500).json({ msg: err.message });
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Fungsi untuk mendapatkan semua data word2vec berdasarkan id
const getAllFileWord2vecById = async (req, res) => {
  try {
    const { id } = req.params;

    // Query untuk menghitung total data word2vec berdasarkan id
    const totalRows = await prisma.word2vec.count({ where: { id: id } });

    // Query untuk mendapatkan semua data word2vec berdasarkan id
    const word2vec = await prisma.word2vec.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        course: true,
        book_title: true,
        out_name: true,
        out_file_path: true,
        out_file_mimetype: true,
        out_file_size: true,
        out_file_url: true,
        conversion_type: true,
        users: {
          select: {
            name: true,
            username: true,
            email: true,
            phone: true,
            profile_images: {
              select: {
                image_name: true,
                image_path: true,
                image_size: true,
                image_url: true,
                image_mimetype: true,
              },
            },
          },
        },
      },
    });

    // Jika tidak menemukan data word2vec berdasarkan id
    if (!word2vec)
      return res.status(404).json({ msg: "Data word2vec berdasarkan id tidak ditemukan" });

    // Deklarasi variabel untuk menetapkan ukuran chunk
    const CHUNK_SIZE = 10000000; // 10MB

    // Deklarasi variabel untuk membaca file
    const readStream = fs.createReadStream(word2vec.file_path, { highWaterMark: CHUNK_SIZE });

    let chunks = [];

    // Deklarasi variabel untuk membaca file dengan event
    readStream.on("data", (chunk) => {
      chunks.push(chunk);
    });

    // Deklarasi variabel jika sudah selesai membaca file
    readStream.on("end", () => {
      response(
        200,
        { word2vec, content: chunks },
        { totalRows },
        "Berhasil mendapatkan data word2vec berdasarkan id",
        res
      );
    });

    // Deklarasi variabel jika terjadi error saat membaca file
    readStream.on("error", (err) => {
      res.status(500).json({ msg: err.message });
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Fungsi untuk mengubah data word2vec
const updateInformationWord2vec = async (req, res) => {
  try {
    const { book_title } = req.body;
    const { id } = req.params;

    // Query untuk mendapatkan data word2vec berdasarkan id
    const word2vec = await prisma.word2vec.findUnique({
      where: {
        id: id,
      },
    });

    // Jika data word2vec tidak ditemukan
    if (!word2vec) return res.status(404).json({ msg: "Data word2vec tidak ditemukan" });

    const outFileName = `${book_title}-[Word2vec]` + ".txt";

    const filepath = word2vec.out_file_path;

    // Fungsi untuk mengubah nama file
    fs.renameSync(filepath, `public/converteds/word2vec/${req.userId}/${outFileName}`);

    // Fungsi untuk mengubah data word2vec
    await prisma.word2vec
      .update({
        where: {
          id: id,
        },
        data: {
          book_title: book_title,
          out_name: outFileName,
          out_file_path: convertedPath + `/${req.userId}/${outFileName}`,
          out_file_url: `${req.protocol}://${req.get("host")}/word2vec/${req.name}/${
            word2vec.course
          }/${req.userId}/${outFileName}`,
        },
      })
      // Jika berhasil mengubah data word2vec
      .then((result) => {
        response(200, result, {}, "Word2vec berhasil di update", res);
      })
      // Jika terjadi kesalahan saat mengubah data word2vec
      .catch((error) => {
        throw {
          code: 500,
          message: "Terjadi kesalahan saat mengubah data word2vec",
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

// Fungsi untuk menghapus data word2vec
const deleteWord2vec = async (req, res) => {
  const { id } = req.params;

  // Query untuk mendapatkan data word2vec berdasarkan id
  const word2vec = await prisma.word2vec.findUnique({
    where: {
      id: id,
    },
  });

  // Jika data word2vec tidak ditemukan
  if (!word2vec) return response(404, [], {}, "Data word2vec tidak ditemukan", res);

  try {
    const filepath = word2vec.out_file_path;
    // Fungsi untuk menghapus file
    fs.unlinkSync(filepath);

    // Fungsi untuk menghapus data word2vec
    await prisma.word2vec
      .delete({
        where: {
          id: id,
        },
      })
      // Jika berhasil menghapus data word2vec
      .then((result) => {
        response(200, result, {}, "Berhasil menghapus data word2vec", res);
      }) // Jika terjadi kesalahan saat mengubah data word2vec
      .catch((error) => {
        throw {
          code: 500,
          message: "Terjadi kesalahan saat menghapus data word2vec",
          detailError: error.message,
        };
      })
      // Jika sudah selesai, maka tutup koneksi ke database
      .finally(async () => {
        await prisma.$disconnect();
      });
  } catch (error) {
    response(500, [], {}, "Terjadi kesalahan saat menghapus data word2vec", res);
  }
};

const downloadWord2vec = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.word2vec
      .findUnique({
        where: {
          id: id,
        },
      })
      .then((result) => {
        let file = result.out_file_path;
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
          message: "Terjadi kesalahan saat mendownload file word2vec",
          detailError: error.message,
        };
      })
      // Jika sudah selesai, maka tutup koneksi ke database
      .finally(async () => {
        await prisma.$disconnect();
      });
  } catch (error) {
    res.status(400).send("Eror saat mendownload file. Silahkan coba lagi.");
  }
};

module.exports = {
  deleteWord2vec,
  getAllListsFileWord2vec,
  getAllFileWord2vecById,
  getListsFileWord2vecByDosen,
  getFileWord2vecById,
  convertWord2vec,
  downloadWord2vec,
  filterAllListsFileWord2vec,
  searchAllListsFileWord2vec,
  updateInformationWord2vec,
};
