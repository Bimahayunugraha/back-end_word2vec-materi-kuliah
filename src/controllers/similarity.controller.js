const prisma = require("../configs/prisma");
const response = require("../utils/response");

// Fungsi untuk mendapatkan semua data kesamaan berdasarkan id user
const getAllSimilarityListsByDosen = async (req, res) => {
  try {
    const last_id = String(req.query.lastId) || "";
    const page = parseInt(req.query.page) || 0;
    const take = parseInt(req.query.take) || 10;
    const skip = take * page;

    // Query untuk menghitung total data kesamaan berdasarkan id user
    const totalRows = await prisma.similarity.count({ where: { id_user: req.userId } });

    // Fungsi untuk menghitung total halaman
    const totalPage = Math.ceil(totalRows / take);

    let result = [];

    // Jika last_id kosong
    if (last_id === "") {
      // Query untuk mendapatkan semua data kesamaan berdasarkan id user
      const results = await prisma.similarity.findMany({
        take: take,
        where: { id_user: req.userId },
        orderBy: { id: "desc" },
      });

      result = results;
      // Jika last_id tidak kosong
    } else {
      // Query untuk mendapatkan semua data kesamaan berdasarkan id user dan last_id
      const results = await prisma.similarity.findMany({
        take: take,
        where: {
          AND: [{ id_user: req.userId }, { id: { lt: last_id } }],
        },
        orderBy: { id: "desc" },
      });

      result = results;
    }

    // Jika berhasil mendapatkan data kesamaan
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
      "Berhasil mendapatkan data kesamaan",
      res
    );
    // Jika terjadi kesalahan saat mendapatkan data kesamaan
  } catch (err) {
    return res.status(400).json({
      message: "Terjadi kesalahan saat mendapatkan data kesamaan",
      detailError: err.detailError,
    });
  }
};

// Fungsi untuk mendapatkan data kesamaan dosen berdasarkan nama ujian
const getSimilarityListsDosenByExamName = async (req, res) => {
  try {
    const { exam_name } = req.params;

    // Query untuk menghitung total data kesamaan berdasarkan id user dan nama ujian
    const totalRows = await prisma.similarity.count({
      where: { AND: [{ id_user: req.userId }, { exam_name: exam_name }] },
    });

    // Query untuk mendapatkan data kesamaan berdasarkan id user dan nama ujian
    await prisma.similarity
      .findMany({
        where: { AND: [{ id_user: req.userId }, { exam_name: exam_name }] },
        orderBy: { updatedAt: "desc" },
      })
      // Jika berhasil mendapatkan data kesamaan
      .then((result) => {
        return response(
          200,
          result,
          { totalRows: totalRows },
          "Berhasil mendapatkan data kesamaan berdasarkan nama ujian",
          res
        );
      })
      // Jika terjadi kesalahan saat mendapatkan data kesamaan
      .catch((err) => {
        throw {
          code: 400,
          message: "Terjadi kesalahan saat mendapatkan data kesamaan berdasarkan nama ujian",
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

// Fungsi untuk mendapatkan data kesamaan dosen berdasarkan kelas
const getSimilarityListsDosenByStudentClass = async (req, res) => {
  try {
    const { exam_name, student_class } = req.params;

    // Query untuk menghitung total data kesamaan berdasarkan id user, nama ujian, dan kelas
    const totalRows = await prisma.similarity.count({
      where: {
        AND: [{ id_user: req.userId }, { exam_name: exam_name }, { student_class: student_class }],
      },
    });

    // Query untuk mendapatkan data kesamaan berdasarkan id user, nama ujian, dan kelas
    await prisma.similarity
      .findMany({
        where: {
          AND: [
            { id_user: req.userId },
            { exam_name: exam_name },
            { student_class: student_class },
          ],
        },
        orderBy: { student_nim: "asc" },
      })
      // Jika berhasil mendapatkan data kesamaan berdasarkan nama ujian dan kelas
      .then((result) => {
        return response(
          200,
          result,
          { totalRows: totalRows },
          "Berhasil mendapatkan data kesamaan berdasarkan nama ujian dan kelas",
          res
        );
      })
      // Jika terjadi kesalahan saat mendapatkan data kesamaan berdasarkan nama ujian dan kelas
      .catch((err) => {
        throw {
          code: 400,
          message:
            "Terjadi kesalahan saat mendapatkan data kesamaan berdasarkan nama ujian dan kelas",
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

// Fungsi untuk mencari data kesamaan dosen berdasarkan kelas
const searcSimilarityListsDosenByStudentClass = async (req, res) => {
  try {
    const { exam_name, student_class } = req.params;
    const search = req.query.search_query || "";

    // Query untuk menghitung total data kesamaan berdasarkan id user, nama ujian, dan kelas
    const totalRows = await prisma.similarity.count({
      where: {
        AND: [{ id_user: req.userId }, { exam_name: exam_name }, { student_class: student_class }],
        OR: [
          {
            student_nim: {
              contains: search,
            },
          },
        ],
      },
    });

    // Query untuk mendapatkan data kesamaan berdasarkan id user, nama ujian, dan kelas
    await prisma.similarity
      .findMany({
        where: {
          AND: [
            { id_user: req.userId },
            { exam_name: exam_name },
            { student_class: student_class },
          ],
          OR: [
            {
              student_nim: {
                contains: search,
              },
            },
          ],
        },
        orderBy: { student_nim: "asc" },
      })
      // Jika berhasil mendapatkan data kesamaan berdasarkan nama ujian dan kelas
      .then((result) => {
        return response(
          200,
          result,
          { totalRows: totalRows },
          "Berhasil mendapatkan data kesamaan berdasarkan nama ujian dan kelas",
          res
        );
      })
      // Jika terjadi kesalahan saat mendapatkan data kesamaan berdasarkan nama ujian dan kelas
      .catch((err) => {
        throw {
          code: 400,
          message:
            "Terjadi kesalahan saat mendapatkan data kesamaan berdasarkan nama ujian dan kelas",
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

// Fungsi untuk mendapatkan detail data kesamaan berdasarkan id user, nama ujian, kelas, dan nim mahasiswa
const getDetailSimilarityDosenByStudent = async (req, res) => {
  try {
    const { exam_name, student_class, student_nim } = req.params;

    // Query untuk menghitung total data kesamaan berdasarkan id user, nama ujian, kelas, dan nim mahasiswa
    const totalRows = await prisma.similarity.count({
      where: {
        AND: [
          { id_user: req.userId },
          { exam_name: exam_name },
          { student_class: student_class },
          { student_nim: student_nim },
        ],
      },
    });

    //
    await prisma.similarity
      .findMany({
        where: {
          AND: [
            { id_user: req.userId },
            { exam_name: exam_name },
            { student_class: student_class },
            { student_nim: student_nim },
          ],
        },
        orderBy: { createdAt: "asc" },
      })
      // Jika berhasil mendapatkan data kesamaan
      .then((result) => {
        return response(
          200,
          result,
          { totalRows: totalRows },
          "Berhasil mendapatkan data kesamaan berdasarkan nama ujian, kelas, dan nim mahasiswa",
          res
        );
      })
      // Jika terjadi kesalahan saat mendapatkan data kesamaan
      .catch((err) => {
        throw {
          code: 400,
          message:
            "Terjadi kesalahan saat mendapatkan data kesamaan berdasarkan nama ujian, kelas, dan nim mahasiswa",
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

// Fungsi untuk mendapatkan semua data kesamaan
const getAllSimilarityLists = async (req, res) => {
  try {
    const last_id = String(req.query.lastId) || "";
    const page = parseInt(req.query.page) || 0;
    const take = parseInt(req.query.take) || 10;
    const skip = take * page;

    // Query untuk menghitung total semua data kesamaan
    const totalRows = await prisma.similarity.count();

    // Fungsi untuk menghitung total halaman
    const totalPage = Math.ceil(totalRows / take);

    let result = [];

    // Jika last_id kosong
    if (last_id === "") {
      // Query untuk mendapatkan semua data kesamaan
      const results = await prisma.similarity.findMany({
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
      // Query untuk mendapatkan semua data kesamaan berdasarkan last_id
      const results = await prisma.similarity.findMany({
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

    // Jika berhasil mendapatkan semua data kesamaan
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
      "Berhasil mendapatkan semua data kesamaan",
      res
    );
    // Jika terjadi kesalahan saat mendapatkan semua data kesamaan
  } catch (err) {
    return res.status(400).json({
      message: "Terjadi kesalahan saat mendapatkan data kesamaan",
      detailError: err.detailError,
    });
  }
};

// Fungsi untuk mendapatkan semua data kesamaan berdasarkan nama ujian
const getAllSimilarityListsByExamName = async (req, res) => {
  try {
    const { exam_name } = req.params;

    // Query untuk menghitung total data kesamaan berdasarkan nama ujian
    const totalRows = await prisma.similarity.count({
      where: { exam_name: exam_name },
    });

    // Query untuk mendapatkan semua data kesamaan berdasarkan nama ujian
    await prisma.similarity
      .findMany({
        where: { exam_name: exam_name },
        orderBy: { updatedAt: "desc" },
      })
      // Jika berhasil mendapatkan semua data kesamaan
      .then((result) => {
        return response(
          200,
          result,
          { totalRows: totalRows },
          "Berhasil mendapatkan semua data kesamaan berdasarkan nama ujian",
          res
        );
      })
      // Jika terjadi kesalahan saat mendapatkan semua data kesamaan
      .catch((err) => {
        throw {
          code: 400,
          message: "Terjadi kesalahan saat mendapatkan semua data kesamaan berdasarkan nama ujian",
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

// Fungsi untuk mendapatkan semua data kesamaan berdasarkan kelas
const getAllSimilarityListsByStudentClass = async (req, res) => {
  try {
    const { exam_name, student_class } = req.params;

    // Query untuk menghitung total data kesamaan berdasarkan nama ujian dan kelas
    const totalRows = await prisma.similarity.count({
      where: {
        AND: [{ exam_name: exam_name }, { student_class: student_class }],
      },
    });

    // Query untuk mendapatkan semua data kesamaan berdasarkan nama ujian dan kelas
    await prisma.similarity
      .findMany({
        where: {
          AND: [{ exam_name: exam_name }, { student_class: student_class }],
        },
        orderBy: { student_nim: "asc" },
      })
      // Jika berhasil mendapatkan semua data kesamaan berdasarkan nama ujian dan kelas
      .then((result) => {
        return response(
          200,
          result,
          { totalRows: totalRows },
          "Berhasil mendapatkan semua data kesamaan berdasarkan nama ujian dan kelas",
          res
        );
      })
      // Jika terjadi kesalahan saat mendapatkan semua data kesamaan berdasarkan nama ujian dan kelas
      .catch((err) => {
        throw {
          code: 400,
          message:
            "Terjadi kesalahan saat mendapatkan semua data kesamaan berdasarkan nama ujian dan kelas",
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

// Fungsi untuk mencari semua data kesamaan berdasarkan kelas
const searcAllSimilarityListsByStudentClass = async (req, res) => {
  try {
    const { exam_name, student_class } = req.params;
    const search = req.query.search_query || "";

    // Query untuk menghitung total semua data kesamaan berdasarkan nama ujian dan kelas
    const totalRows = await prisma.similarity.count({
      where: {
        AND: [{ exam_name: exam_name }, { student_class: student_class }],
        OR: [
          {
            student_nim: {
              contains: search,
            },
          },
        ],
      },
    });

    // Query untuk mendapatkan semua data kesamaan berdasarkan nama ujian dan kelas
    await prisma.similarity
      .findMany({
        where: {
          AND: [{ exam_name: exam_name }, { student_class: student_class }],
          OR: [
            {
              student_nim: {
                contains: search,
              },
            },
          ],
        },
        orderBy: { student_nim: "asc" },
      })
      // Jika berhasil mendapatkan semua data kesamaan berdasarkan nama ujian dan kelas
      .then((result) => {
        return response(
          200,
          result,
          { totalRows: totalRows },
          "Berhasil mendapatkan semua data kesamaan berdasarkan nama ujian dan kelas",
          res
        );
      })
      // Jika terjadi kesalahan saat mendapatkan data kesamaan berdasarkan nama ujian dan kelas
      .catch((err) => {
        throw {
          code: 400,
          message:
            "Terjadi kesalahan saat mendapatkan semua data kesamaan berdasarkan nama ujian dan kelas",
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

// Fungsi untuk mendapatkan detail data kesamaan berdasarkan nama ujian, kelas, dan nim mahasiswa
const getDetailSimilarityByStudent = async (req, res) => {
  try {
    const { exam_name, student_class, student_nim } = req.params;

    // Query untuk menghitung total data kesamaan berdasarkan nama ujian, kelas, dan nim mahasiswa
    const totalRows = await prisma.similarity.count({
      where: {
        AND: [
          { exam_name: exam_name },
          { student_class: student_class },
          { student_nim: student_nim },
        ],
      },
    });

    //
    await prisma.similarity
      .findMany({
        where: {
          AND: [
            { exam_name: exam_name },
            { student_class: student_class },
            { student_nim: student_nim },
          ],
        },
        orderBy: { createdAt: "asc" },
      })
      // Jika berhasil mendapatkan data kesamaan
      .then((result) => {
        return response(
          200,
          result,
          { totalRows: totalRows },
          "Berhasil mendapatkan data kesamaan berdasarkan nama ujian, kelas, dan nim mahasiswa",
          res
        );
      })
      // Jika terjadi kesalahan saat mendapatkan data kesamaan
      .catch((err) => {
        throw {
          code: 400,
          message:
            "Terjadi kesalahan saat mendapatkan data kesamaan berdasarkan nama ujian, kelas, dan nim mahasiswa",
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

module.exports = {
  getDetailSimilarityDosenByStudent,
  getAllSimilarityListsByDosen,
  getSimilarityListsDosenByExamName,
  getSimilarityListsDosenByStudentClass,
  searcSimilarityListsDosenByStudentClass,
  getAllSimilarityLists,
  getAllSimilarityListsByExamName,
  getAllSimilarityListsByStudentClass,
  searcAllSimilarityListsByStudentClass,
  getDetailSimilarityByStudent,
};
