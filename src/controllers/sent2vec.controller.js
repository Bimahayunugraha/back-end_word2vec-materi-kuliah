const w2v = require("word2vec");
const response = require("../utils/response");
const db = require("../configs/db");
const fs = require("fs-extra");
const fsp = require("fs/promises");
const fsb = require("fs");
const readline = require("readline");
const path = require("path");
const prisma = require("../configs/prisma");
const uniqueId = require("../utils/generateUniqueId");

const Word2vec = db.word2vec;

const Op = db.Sequelize.Op;
let uploadPath = "public/uploads/word2vec";
let convertedPath = "public/converteds/word2vec";

const getAllFilesWord2vec = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const take = parseInt(req.query.take) || 10;
    const skip = take * page;

    const totalRows = await prisma.word2vec.count();
    const totalPage = Math.ceil(totalRows / take);

    const results = await prisma.word2vec.findMany({
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
    response(
      200,
      results,
      { totalRows: totalRows, take: take, page: page, totalPage: totalPage, skip: skip },
      "Berhasil mendapatkan semua data word2vec",
      res
    );
  } catch (err) {
    return res.status(400).json({
      message: "Terjadi kesalahan saat mendapatkan semua data word2vec",
      detailError: err.detailError,
    });
  }
};

// const readMultipleFiles = (files, callback) => {
//   const contents = [];

//   files.forEach((file, index) => {
//     fs.readFile(file, "utf8", (err, data) => {
//       if (err) {
//         callback(err);
//         return;
//       }

//       contents[index] = data;
//     });
//   });
// };

const searchWord2vec = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const take = parseInt(req.query.take) || 10;
    const search = req.query.search_query || "";
    const skip = take * page;

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
    const totalPage = Math.ceil(totalRows / take);

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

    if (!word2vec) return res.status(404).json({ msg: "Data word2vec tidak ditemukan" });

    // const files = word2vec.map((file) => __basedir + file.file_path);
    // console.log(files);

    // readMultipleFiles(files, (err, contents) => {
    //   if (err) {
    //     console.error(err);
    //     res.status(500).send("Error reading files");
    //   } else {
    //     console.log(contents);
    //     response(
    //       200,
    //       { word2vec, content: contents },
    //       { totalRows: totalRows, limit: limit, page: page, totalPage: totalPage, offset: offset },
    //       "Berhasil mendapatkan semua data word2vec",
    //       res
    //     );
    //   }
    // });

    response(
      200,
      word2vec,
      { totalRows: totalRows, take: take, page: page, totalPage: totalPage, skip: skip },
      "Berhasil mendapatkan semua data word2vec",
      res
    );
  } catch (err) {
    return res.status(400).json({
      message: "Terjadi kesalahan saat mendapatkan semua data word2vec",
      detailError: err.message,
    });
  }
};

const filterWord2vec = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const take = parseInt(req.query.take) || 10;
    const filterDosen = req.query.dosen || "";
    const filterMataKuliah = req.query.mata_kuliah || "";
    const skip = take * page;

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
    const totalPage = Math.ceil(totalRows / take);

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

    if (!word2vec) return res.status(404).json({ msg: "Data tidak ditemukan" });

    response(
      200,
      word2vec,
      { totalRows: totalRows, take: take, page: page, totalPage: totalPage, skip: skip },
      "Berhasil mendapatkan semua data word2vec",
      res
    );
  } catch (err) {
    return res.status(400).json({
      message: "Terjadi kesalahan saat mendapatkan semua data word2vec",
      detailError: err.detailError,
    });
  }
};

const getListFiles = async (req, res) => {
  try {
    const totalRows = await prisma.word2vec.count({ where: { id_user: req.userId } });
    await prisma.word2vec
      .findMany({
        where: {
          AND: [{ conversion_type: "word2vec" }, { id_user: req.userId }],
        },
        orderBy: {
          updatedAt: "desc",
        },
      })
      .then((result) => {
        return response(
          200,
          result,
          { totalRows: totalRows },
          "Berhasil mendapatkan data dengan tipe word2vec",
          res
        );
      })
      .catch((err) => {
        throw {
          code: 400,
          message: "Terjadi kesalahan saat mendapatkan data dengan tipe word2vec",
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

const getListFilesSent2vec = async (req, res) => {
  try {
    await Word2vec.findAndCountAll({
      where: {
        [Op.and]: [{ conversion_type: "sent2vec" }, { id_users: req.userId }],
      },
      order: [["createdAt", "DESC"]],
    })
      .then((result) => {
        return response(200, result, "Berhasil mendapatkan data dengan tipe sent2vec", res);
      })
      .catch((err) => {
        throw {
          code: 400,
          message: "Terjadi kesalahan saat mendapatkan data dengan tipe sent2vec",
          detailError: err.message,
        };
      });
  } catch (err) {
    return res.status(err.code).json({
      message: err.message,
      detailError: err.detailError,
    });
  }
};

// Fungsi untuk mengkonversi file korpus menjadi word2vec
const convertVector = async (req, res) => {
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

    // const filepath = __basedir + `/converteds/word2vec/${req.userId}/${outFileName}`;

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
      if (!fs.existsSync(__basedir + `/converteds/word2vec/${req.userId}`)) {
        fs.mkdirSync(__basedir + `/converteds/word2vec/${req.userId}`, { recursive: true });
      }

      // Deklarasi variabel untuk menetapkan path file yang telah dikonversi
      const filepath = __basedir + `/converteds/word2vec/${req.userId}/${outFileName}`;

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

const getFileById = async (req, res) => {
  try {
    const { id } = req.params;

    const totalRows = await prisma.word2vec.count({
      where: { AND: [{ id: id }, { id_user: req.userId }] },
    });

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

    if (!word2vec) return res.status(404).json({ msg: "Data word2vec tidak ditemukan" });

    const CHUNK_SIZE = 10000000; // 10MB

    const readStream = fs.createReadStream(word2vec.out_file_path, "utf8", {
      highWaterMark: CHUNK_SIZE,
    });
    // const rl = readline.createInterface({
    //   input: readStream,
    //   output: process.stdout,
    //   terminal: false,
    // });

    // let lines = [];

    // rl.on("line", (line) => {
    //   lines.push(line);
    // });

    // rl.on("error", (error) => res.status(500).json({ msg: error.message }));

    // rl.on("close", () => {
    //   response(
    //     200,
    //     { word2vec, content: lines },
    //     { totalRows: totalRows },
    //     "Berhasil mendapatkan data word2vec berdasarkan id",
    //     res
    //   );
    // });

    let chunks = [];
    readStream.on("data", (chunk) => {
      chunks.push(chunk);
    });

    readStream.on("end", () => {
      response(
        200,
        { word2vec, content: chunks },
        {},
        "Berhasil mendapatkan data word2vec berdasarkan id",
        res
      );
    });

    readStream.on("error", (err) => {
      res.status(500).json({ msg: err.message });
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const getAllFileById = async (req, res) => {
  try {
    const { id } = req.params;

    const totalRows = await Word2vec.count({ where: { id: id } });

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

    if (!word2vec) return res.status(404).json({ msg: "Data word2vec tidak ditemukan" });

    const CHUNK_SIZE = 10000000; // 10MB
    const readStream = fs.createReadStream(word2vec.file_path, { highWaterMark: CHUNK_SIZE });
    const rl = readline.createInterface({
      input: readStream,
      crlfDelay: Infinity,
    });

    let lines = [];

    rl.on("line", (line) => {
      lines.push(line);
    });

    rl.on("error", (error) => res.status(500).json({ msg: error.message }));

    rl.on("close", () => {
      response(
        200,
        { word2vec, content: lines },
        { totalRows: totalRows },
        "Berhasil mendapatkan data word2vec berdasarkan id",
        res
      );
      res.end();
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const updateWord2vec = async (req, res) => {
  try {
    const { book_title } = req.body;
    const { id } = req.params;

    const word2vec = await prisma.word2vec.findUnique({
      where: {
        id: id,
      },
    });
    if (!word2vec) return res.status(404).json({ msg: "Data word2vec tidak ditemukan" });

    const outFileName = `${book_title}-[Word2vec]` + ".txt";

    const filepath = word2vec.out_file_path;
    fs.renameSync(filepath, `public/converteds/word2vec/${req.userId}/${outFileName}`);

    await prisma.word2vec
      .update({
        where: {
          id: id,
        },
        data: {
          book_title: book_title,
          out_name: outFileName,
          out_file_path: convertedPath + `/${req.userId}/${outFileName}`,
          out_file_url: `${req.protocol}://${req.get("host")}/converteds/word2vec/${req.name}/${
            word2vec.course
          }/${req.userId}/${outFileName}`,
        },
      })
      .then((result) => {
        response(200, result, {}, "Word2vec berhasil di update", res);
      })
      .catch((error) => {
        throw {
          code: 500,
          message: "Terjadi kesalahan saat mengubah data word2vec",
          detailError: error.message,
        };
      })
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

const deleteVector = async (req, res) => {
  const { id } = req.params;

  const word2vec = await prisma.word2vec.findUnique({
    where: {
      id: id,
    },
  });
  if (!word2vec) return response(404, [], {}, "Data word2vec tidak ditemukan", res);

  try {
    const filepath = word2vec.out_file_path;
    fs.unlinkSync(filepath);
    await prisma.word2vec
      .delete({
        where: {
          id: id,
        },
      })
      .then((result) => {
        response(200, result, {}, "Berhasil menghapus data word2vec", res);
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

        let filename = path.basename(file);
        let mimetype = path.extname(file).toLocaleLowerCase();

        res.setHeader("Content-disposition", "attachment; filename=" + filename);
        res.setHeader("Content-type", mimetype);

        let filestream = fs.createReadStream(file);
        filestream.pipe(res);
        // res.set({
        //   "Content-Type": "plain/text",
        //   "Content-Disposition": `attachment; filename=${result.name}`,
        // });

        // res.sendFile(__basedir + result.file_path);
      });
  } catch (error) {
    res.status(400).send("Eror saat mendownload file. Silahkan coba lagi.");
  }
};

const downloadSent2vec = async (req, res) => {
  try {
    const idFile = req.params;
    await Word2vec.findOne({
      where: {
        id: idFile,
      },
    }).then((result) => {
      res.set({
        "Content-Type": result.file_mimetype,
      });

      res.sendFile(__basedir + result.file_path);
    });
  } catch (error) {
    res.status(400).send("Eror saat mendownload file. Silahkan coba lagi.");
  }
};

module.exports = {
  deleteVector,
  getAllFilesWord2vec,
  getAllFileById,
  getListFiles,
  getListFilesSent2vec,
  getFileById,
  convertVector,
  downloadWord2vec,
  downloadSent2vec,
  filterWord2vec,
  searchWord2vec,
  updateWord2vec,
};
