const textract = require("textract");
const response = require("../utils/response");
const fs = require("fs-extra");
const path = require("path");
const readline = require("readline");
const prisma = require("../configs/prisma");
const uniqueId = require("../utils/generateUniqueId");

let uploadPath = "public/uploads/corpus";
let convertedPath = "public/converteds/corpus";

const getAllListsFileCorpus = async (req, res) => {
  try {
    // Hitung total data corpus
    const totalRows = await prisma.corpus.count({ where: { id_user: req.userId } });

    // Query untuk mendapatkan semua data corpus
    await prisma.corpus
      .findMany({
        where: { id_user: req.userId },
        orderBy: { updatedAt: "desc" },
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
      })
      .then((result) => {
        // Mengirim response ke klien
        return response(
          200,
          result,
          { totalRows: totalRows },
          "Berhasil mendapatkan data corpus",
          res
        );
      })
      // Jika terjadi error, maka kirim response ke klien
      .catch((err) => {
        throw {
          code: 400,
          message: "Terjadi kesalahan saat mendapatkan data corpus",
          detailError: err.message,
        };
      });
  } catch (err) {
    return res.status(400).json({
      message: err.message,
      detailError: err.detailError,
    });
  }
};

// Fungsi untuk mengkonversi file materi kuliah menjadi korpus teks
const convertCorpus = async (req, res) => {
  try {
    // Deklarasi variable file dan body
    const file = req.file;
    const { course, book_title } = req.body;

    // Cek apakah file ada atau tidak
    if (file == undefined) {
      return response(400, Error, "Pilih file terlebih dahulu", res);
    }

    // Cek direktori untuk menyimpan file yang dikonversi apakah sudah ada atau belum
    /**
     * Jika belum ada, maka buat direktori baru
     * Jika sudah ada, maka lanjutkan proses
     */
    if (!fs.existsSync(convertedPath + `/${req.userId}`)) {
      fs.mkdirSync(convertedPath + `/${req.userId}`, { recursive: true });
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
    const outFileName = `${book_title}-[Corpus]` + outExt;

    // Deklarasi variabel untuk menetapkan path file yang dikonversi
    const filepath = convertedPath + `/${req.userId}` + `/${outFileName}`;

    // fungsi untuk mengkonversi file yang diupload ke dalam bentuk text
    textract.fromFileWithPath(file.path, async (error, data) => {
      // Cek apakah terjadi error atau tidak
      if (error) {
        response(500, error.message, {}, "Gagal mengkonversi file", res);
      } else {
        // Mengubah semua huruf menjadi huruf kecil dan memisahkan kalimat berdasarkan tanda titik
        const sentences = data.toLowerCase().split(/\.\s+/);

        // Deklarasi variabel untuk menampung kalimat yang sudah dipisahkan
        const paragraphs = [];

        let currentParagraph = "";

        // Memisahkan lima kalimat menjadi satu paragraf
        sentences.forEach((sentence, index) => {
          // eslint-disable-next-line no-useless-escape
          const noSpacesSentence = sentence.replace(/[^\w\s\.,]/gi, "");

          if (index % 5 === 0 && index > 0) {
            paragraphs.push(currentParagraph + ".");
            currentParagraph = noSpacesSentence;
          } else {
            currentParagraph += "." + noSpacesSentence;
          }
        });

        // Menambahkan kalimat terakhir ke dalam array paragraphs
        if (currentParagraph.length > 0) {
          paragraphs.push(currentParagraph + ".");
        }

        // Menyimpan file yang telah dikonversi ke dalam path yang telah ditentukan
        fs.writeFileSync(filepath, paragraphs.join("\n"));

        // Deklarasi variabel untuk menetapkan ukuran file yang dikonversi
        let stats = fs.statSync(filepath);
        let fileSizeInBytes = stats.size;

        // Cek apakah judul buku sudah ada atau belum
        const inUniqueCorpus = await prisma.corpus.findFirst({
          where: { book_title: book_title },
        });

        // Jika judul buku sudah ada, maka tampilkan pesan error
        if (inUniqueCorpus) {
          return response(
            403,
            { unique: true },
            {},
            "Judul buku sudah ada!, silahkan ganti judul buku",
            res
          );
        } else {
          // Jika judul buku belum ada, maka simpan data corpus ke dalam database
          await prisma.corpus
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
                in_file_url: `${req.protocol}://${req.get("host")}/uploads/corpus/${
                  req.name
                }/${course}/${req.userId}/${inFileName}`,
                out_name: outFileName,
                out_file_path: convertedPath + `/${req.userId}/${outFileName}`,
                out_file_mimetype: ".txt",
                out_file_size: fileSizeInBytes,
                out_file_url: `${req.protocol}://${req.get("host")}/converteds/corpus/${
                  req.name
                }/${course}/${req.userId}/${outFileName}`,
                conversion_type: "corpus",
              },
            })
            .then(async (result) => {
              await prisma.course_material.create({
                data: {
                  id: result.id,
                  id_user: req.userId,
                  course: result.course,
                  book_title: result.book_title,
                  name: inFileName,
                  file_path: uploadPath + `/${req.userId}/${inFileName}`,
                  file_mimetype: inExt,
                  file_size: fileSize,
                  file_url: `${req.protocol}://${req.get("host")}/uploads/corpus/${
                    req.name
                  }/${course}/${req.userId}/${inFileName}`,
                },
              });

              response(
                200,
                result,
                {},
                "File materi kuliah berhasil dikonversi menjadi korpus",
                res
              );
            });
        }
      }
    });
  } catch (error) {
    response(400, error, {}, "Gagal mengkonversi file materi kuliah ke korpus", res);
  }
};

// Fungsi untuk mengubah isi file corpus
const updateCorpusFileContent = async (req, res) => {
  try {
    const { content } = req.body;
    const { id } = req.params;

    // Query untuk mendapatkan data corpus berdasarkan id
    const corpus = await prisma.corpus.findUnique({
      where: {
        id: id,
      },
    });

    // Cek apakah data corpus ada atau tidak
    if (!corpus) return res.status(404).json({ msg: "Data corpus tidak ditemukan" });

    // Menyimpan isi file corpus ke dalam variabel
    const file = fs.createWriteStream(corpus.out_file_path);

    // Menambahkan event error jika terjadi error saat menulis file
    file.on("error", (error) =>
      res.status(400).json({
        message: error.message,
        detailError: error.detailError,
      })
    );

    // Menulis isi file corpus
    file.write(content.join("\n"));

    // Menambahkan event finish jika selesai menulis file
    file.end();

    // Menghitung ukuran file corpus
    let stats = fs.statSync(corpus.out_file_path);
    let fileSize = stats.size;

    // Query untuk mengupdate isi file corpus
    await prisma.corpus
      .update({
        where: {
          id: id,
        },
        data: {
          out_file_size: fileSize,
        },
      })
      // Jika berhasil, maka kirim response ke klien
      .then((result) => {
        response(200, result, {}, "Isi file Corpus berhasil diubah", res);
      })
      // Jika terjadi error, maka kirim response ke klien
      .catch((error) => {
        throw {
          code: 500,
          message: "Terjadi kesalahan saat mengubah isi file corpus",
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

// Fungsi untuk mengubah data corpus
const updateInformationCorpus = async (req, res) => {
  try {
    const { book_title } = req.body;
    const { id } = req.params;

    // Query untuk mendapatkan data corpus berdasarkan id
    const corpus = await prisma.corpus.findUnique({
      where: {
        id: id,
      },
    });

    // Cek apakah data corpus ada atau tidak
    if (!corpus) return res.status(404).json({ msg: "Data corpus tidak ditemukan" });

    const outFileName = `${book_title}-[Corpus]` + ".txt";

    const filepath = corpus.out_file_path;

    // Mengubah nama file corpus
    fs.renameSync(filepath, `public/converteds/corpus/${req.userId}/${outFileName}`);

    // Query untuk mengupdate data corpus
    await prisma.corpus
      .update({
        where: {
          id: id,
        },
        data: {
          book_title: book_title,
          out_name: outFileName,
          out_file_path: convertedPath + `/${req.userId}/${outFileName}`,
          out_file_url: `${req.protocol}://${req.get("host")}/converteds/corpus/${req.name}/${
            corpus.course
          }/${req.userId}/${outFileName}`,
        },
      })
      // Jika berhasil, maka kirim response ke klien
      .then((result) => {
        response(200, result, {}, "Informasi corpus berhasil diubah", res);
      })
      // Jika terjadi error, maka kirim response ke klien
      .catch((error) => {
        throw {
          code: 500,
          message: "Terjadi kesalahan saat mengubah informasi corpus",
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

// Fungsi untuk mendapatkan data corpus berdasarkan id
const getCorpusById = async (req, res) => {
  try {
    const { id } = req.params;

    // Query untuk mendapatkan data corpus berdasarkan id
    const corpus = await prisma.corpus.findFirst({
      where: {
        AND: [{ id: id }, { id_user: req.userId }],
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

    // Cek apakah data corpus ada atau tidak
    if (!corpus) return res.status(404).json({ msg: "Data corpus tidak ditemukan" });

    // Deklarasi variabel untuk menetapkan ukuran chunk
    const CHUNK_SIZE = 10000000; // 10MB

    // Deklarasi variabel untuk membaca isi file corpus
    const readStream = fs.createReadStream(corpus.out_file_path, "utf8", {
      highWaterMark: CHUNK_SIZE,
    });

    // Deklarasi variabel untuk membaca isi file corpus per baris
    const rl = readline.createInterface({
      input: readStream,
      output: process.stdout,
      terminal: false,
    });

    // Deklarasi variabel untuk menampung isi file corpus per baris
    let lines = [];

    // Menambahkan event line untuk membaca isi file corpus per baris
    rl.on("line", (line) => {
      lines.push(line);
    });

    // Menambahkan event error jika terjadi error saat membaca isi file corpus
    rl.on("error", (error) => res.status(500).json({ msg: error.message }));

    // Menambahkan event close jika selesai membaca isi file corpus
    rl.on("close", () => {
      response(
        200,
        { corpus, content: lines },
        {},
        "Berhasil mendapatkan data corpus berdasarkan id",
        res
      );
      res.end();
    });
    // Jika terjadi error, maka kirim response ke klien
  } catch (error) {
    res.status(500).json({ msg: error.message });
    // Jika sudah selesai, maka tutup koneksi ke database
  } finally {
    await prisma.$disconnect();
  }
};

// Fungsi untuk menghapus data corpus
const deleteCorpus = async (req, res) => {
  const { id } = req.params;

  // Query untuk mendapatkan data corpus berdasarkan id
  const corpus = await prisma.corpus.findUnique({
    where: {
      id: id,
    },
  });

  // Cek apakah data corpus ada atau tidak
  if (!corpus) return response(404, [], {}, "Data corpus tidak ditemukan", res);

  try {
    const out_filepath = corpus.out_file_path;

    // Menghapus file corpus
    fs.unlinkSync(out_filepath);

    // Query untuk menghapus data corpus
    await prisma.corpus
      .delete({
        where: {
          id: id,
        },
      })
      // Jika berhasil, maka kirim response ke klien
      .then((result) => {
        response(200, result, {}, "Berhasil menghapus data corpus", res);
      }) // Jika terjadi error, maka kirim response ke klien
      .catch((error) => {
        throw {
          code: 500,
          message: "Terjadi kesalahan saat menghapus data corpus",
          detailError: error.message,
        };
      })
      // Jika sudah selesai, maka tutup koneksi ke database
      .finally(async () => {
        await prisma.$disconnect();
      });
    // Jika terjadi error, maka kirim response ke klien
  } catch (error) {
    response(500, [], {}, "Terjadi kesalahan saat menghapus data corpus", res);
  }
};

// Fungsi untuk mendownload file corpus
const downloadCorpus = async (req, res) => {
  try {
    const { id } = req.params;

    // Query untuk mendapatkan data corpus berdasarkan id
    await prisma.corpus
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
          message: "Terjadi kesalahan saat mendownload file corpus",
          detailError: error.message,
        };
      })
      // Jika sudah selesai, maka tutup koneksi ke database
      .finally(async () => {
        await prisma.$disconnect();
      });
    // Jika terjadi error, maka kirim response ke klien
  } catch (error) {
    res.status(400).send({
      mesage: "Eror saat mendownload file. Silahkan coba lagi.",
      detailError: error.message,
    });
  }
};

module.exports = {
  deleteCorpus,
  getAllListsFileCorpus,
  getCorpusById,
  convertCorpus,
  downloadCorpus,
  updateCorpusFileContent,
  updateInformationCorpus,
};
