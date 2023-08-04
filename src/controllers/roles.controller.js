const response = require("../utils/response");
const prisma = require("../configs/prisma");
const uniqueId = require("../utils/generateUniqueId");

// Fungsi untuk mendapatkan semua data role
const getAllListsRole = async (req, res) => {
  try {
    // Fungsi untuk membatasi akses mendapatkan data role
    if (req.role === "admin") {
      // Query untuk menghitung total data role
      const totalRows = await prisma.roles.count();

      // Query untuk mendapatkan semua data role
      await prisma.roles
        .findMany({ orderBy: { updatedAt: "desc" } })
        // Jika berhasil mendapatkan data role
        .then((result) => {
          return response(
            200,
            result,
            { totalRows: totalRows },
            "Berhasil mendapatkan data role",
            res
          );
        })
        // Jika terjadi kesalahan saat mendapatkan data role
        .catch((err) => {
          throw {
            code: 400,
            message: err.message,
            detailError: err.message,
          };
        });
      // Jika yang mengakses bukan admin, maka tampilkan pesan akses terlarang
    } else {
      return response(403, [], {}, "Akses terlarang", res);
    }
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      detailError: error.detailError,
    });
  }
};

// Fungsi untuk menambahkan data role
const addRole = async (req, res) => {
  try {
    const { role_name } = req.body;

    // Jika data role kosong
    if (!role_name) return response(400, [], "Isi data yang kosong!", res);

    // Query untuk mengecek apakah role sudah ada atau belum
    const inUniqueAddRole = await prisma.roles.findFirst({
      where: {
        OR: [
          {
            role_name: role_name,
          },
        ],
      },
    });

    // Jika role sudah ada
    if (inUniqueAddRole) {
      return response(
        403,
        { unique: true },
        {},
        "Role sudah ada. Silahkan masukkan role yang lain",
        res
      );
      // Jika role belum ada
    } else {
      await prisma.roles
        .create({
          data: {
            id: await uniqueId(),
            role_name: role_name,
          },
        })
        // Jika berhasil menambahkan role
        .then((result) => {
          response(201, result, {}, "Berhasil menambahkan role", res);
        })
        // Jika terjadi kesalahan saat menambahkan role
        .catch((err) => {
          response(500, err.message, {}, "Terjadi kesalahan saat menambahkan role", res);
        }) // Jika sudah selesai, maka tutup koneksi ke database
        .finally(async () => {
          await prisma.$disconnect();
        });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      detailError: error.detailError,
    });
  }
};

// Fungsi untuk mengubah data role
const editRole = async (req, res) => {
  try {
    const { role_name } = req.body;
    const { id } = req.params;

    // Query untuk mendapatkan data role berdasarkan id
    const role = await prisma.roles.findUnique({
      where: {
        id: id,
      },
    });

    // Jika data role tidak ditemukan
    if (!role) return res.status(404).json({ msg: "Data role tidak ditemukan" });

    // Fungsi untuk membatasi akses mendapatkan data role
    if (req.role === "admin") {
      // Query untuk mengubah data role
      await prisma.roles
        .update({
          where: {
            id: id,
          },
          data: {
            role_name: role_name,
          },
        })
        // Jika berhasil mengubah data role
        .then((result) => {
          response(200, result, {}, "Role berhasil di update", res);
        })
        // Jika terjadi kesalahan saat mengubah data role
        .catch((error) => {
          throw {
            code: 500,
            message: "Terjadi kesalahan saat mengubah data role",
            detailError: error.message,
          };
        })
        // Jika sudah selesai, maka tutup koneksi ke database
        .finally(async () => {
          await prisma.$disconnect();
        });
      // Jika yang mengakses bukan admin, maka tampilkan pesan akses terlarang
    } else {
      return response(403, [], {}, "Akses terlarang", res);
    }
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      detailError: error.detailError,
    });
  }
};

// Fungsi untuk menghapus data role
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    // Query untuk mendapatkan data role berdasarkan id
    const role = await prisma.roles.findUnique({
      where: {
        id: id,
      },
    });

    // Jika data role tidak ditemukan
    if (!role) return res.status(404).json({ msg: "Data role tidak ditemukan" });

    // Fungsi untuk membatasi akses menghapus data role
    if (req.role === "admin") {
      // Query untuk menghapus data role
      await prisma.roles
        .delete({
          where: {
            id: id,
          },
        })
        // Jika berhasil menghapus data role
        .then((result) => {
          response(200, result, {}, "Role berhasil di hapus", res);
        }) // Jika terjadi kesalahan saat menghapus data role
        .catch((error) => {
          throw {
            code: 500,
            message: "Terjadi kesalahan saat menghapus data role",
            detailError: error.message,
          };
        })
        // Jika sudah selesai, maka tutup koneksi ke database
        .finally(async () => {
          await prisma.$disconnect();
        });
      // Jika yang mengakses bukan admin, maka tampilkan pesan akses terlarang
    } else {
      return response(403, [], {}, "Akses terlarang", res);
    }
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      detailError: error.detailError,
    });
  }
};

module.exports = { getAllListsRole, addRole, editRole, deleteRole };
