const response = require("../utils/response");
const prisma = require("../configs/prisma");
const fs = require("fs-extra");
const md5 = require("md5");
const path = require("path");
const bcrypt = require("bcryptjs");

// Fungsi untuk mendapatkan semua data user dengan role dosen
const getAllUsersWithRoleDosen = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const take = parseInt(req.query.take) || 10;
    const skip = take * page;

    // Query untuk menghitung total data user dengan role dosen
    const totalRows = await prisma.users.count({
      where: {
        roles: {
          role_name: "dosen",
        },
      },
    });

    // Fungsi untuk menghitung total halaman
    const totalPage = Math.ceil(totalRows / take);

    // Query untuk mendapatkan semua data user dengan role dosen
    const users = await prisma.users.findMany({
      skip: skip,
      take: take,
      where: {
        roles: {
          role_name: "dosen",
        },
      },
      orderBy: {
        name: "asc",
      },
      include: {
        roles: {
          select: {
            role_name: true,
          },
        },
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
    });

    // Jika data user tidak ditemukan
    if (!users) return res.status(404).json({ msg: "Data user tidak ditemukan" });

    // Mengirim response ke klien
    response(
      200,
      users,
      { totalRows: totalRows, take: take, page: page, totalPage: totalPage, skip: skip },
      "Berhasil mendapatkan data user dengan role dosen",
      res
    );
    // Jika terjadi error
  } catch (err) {
    return res.status(400).json({
      message: "Terjadi kesalahan saat mendapatkan semua data user dengan role dosen",
      detailError: err.detailError,
    });
  }
};

// Fungsi untuk mencari data user dengan role dosen
const searchUsersWithRoleDosen = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const take = parseInt(req.query.take) || 10;
    const search = req.query.search_query || "";
    const skip = take * page;

    // Query untuk menghitung total data user dengan role dosen
    const totalRows = await prisma.users.count({
      where: {
        roles: {
          role_name: "dosen",
        },
        OR: [
          {
            name: {
              contains: search,
            },
          },
          {
            username: {
              contains: search,
            },
          },
        ],
      },
      orderBy: {
        name: "asc",
      },
    });

    // Fungsi untuk menghitung total halaman
    const totalPage = Math.ceil(totalRows / take);

    // Query untuk mendapatkan data user dengan role dosen
    const users = await prisma.users.findMany({
      where: {
        roles: {
          role_name: "dosen",
        },
        OR: [
          {
            name: { contains: search },
          },
          {
            username: { contains: search },
          },
        ],
      },

      skip: skip,
      take: take,
      orderBy: {
        name: "asc",
      },
      include: {
        roles: {
          select: {
            role_name: true,
          },
        },
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
    });

    // Jika data user tidak ditemukan, mengirim response ke klien
    if (!users) return res.status(404).json({ msg: "Data user tidak ditemukan" });

    // Jika data user ditemukan, mengirim response ke klien
    response(
      200,
      users,
      { totalRows: totalRows, take: take, page: page, totalPage: totalPage, skip: skip },
      "Berhasil mendapatkan user dengan role dosen",
      res
    );
    // Jika terjadi error
  } catch (err) {
    return res.status(400).json({
      message: "Terjadi kesalahan saat mendapatkan semua data user",
      detailError: err.message,
    });
  }
};

// Fungsi untuk menghapus data user dengan role dosen
const deleteUserWithRoleDosen = async (req, res) => {
  const { id } = req.params;

  // Query untuk mendapatkan data user dengan role dosen berdasarkan id
  const user = await prisma.users.findUnique({
    where: {
      id: id,
    },
    select: {
      profile_images: {
        select: {
          id: true,
          image_name: true,
          image_path: true,
          image_size: true,
          image_url: true,
          image_mimetype: true,
        },
      },
    },
  });

  // Jika data user tidak ditemukan
  if (!user) return res.status(404).json({ msg: "Data user tidak ditemukan" });

  try {
    const out_filepath = user.profile_images.image_path;

    // Menghapus file gambar profil user
    fs.rmSync(out_filepath, { recursive: true, force: true });

    // Query untuk menghapus foto profil user dengan role dosen berdasarkan id
    await prisma.profile_images
      .delete({
        where: {
          id: user.profile_images.id,
          id_users: user.id,
        },
      })
      .then(async () => {
        // Query untuk menghapus data user dengan role dosen
        await prisma.users
          .delete({
            where: {
              id: id,
            },
          })
          // Jika data user berhasil dihapus, mengirim response ke klien
          .then((result) => {
            response(200, result, {}, "Berhasil menghapus user dengan role dosen", res);
          }) // Jika sudah selesai, maka tutup koneksi ke database
          .finally(async () => {
            await prisma.$disconnect();
          });
      });
    // Jika terjadi error
  } catch (error) {
    return res.status(400).json({
      message: "Terjadi kesalahan saat menghapus data user",
      detailError: error.message,
    });
  }
};

// Fungsi untuk mengubah informasi profile user dengan role dosen
const updateInformationProfileUserWithRoleDosen = async (req, res) => {
  const { id } = req.params;

  // Query untuk mendapatkan data user dengan role dosen berdasarkan id
  const user = await prisma.users.findUnique({
    where: {
      id: id,
    },
  });

  // Jika data user tidak ditemukan
  if (!user) return res.status(404).json({ msg: "Data user tidak ditemukan" });

  const { name, username, email, phone } = req.body;

  try {
    // Query untuk mengubah informasi profile user dengan role dosen
    await prisma.users
      .update({
        where: {
          id: id,
        },
        data: {
          name: name,
          username: username,
          email: email,
          phone: phone,
        },
      })
      // Jika berhasil mengubah informasi profile user dengan role dosen
      .then((result) => {
        response(200, result, {}, "Informasi profile berhasil diubah", res);
      }) // Jika terjadi kesalahan saat mendapatkan data materi kuliah
      .catch((err) => {
        throw {
          code: 400,
          message: "Terjadi kesalahan saat mengubah informasi profile user dengan role dosen",
          detailError: err.message,
        };
      })
      // Jika sudah selesai, maka tutup koneksi ke database
      .finally(async () => {
        await prisma.$disconnect();
      });
  } catch (error) {
    response(400, error, {}, "Profile gagal diubah", res);
  }
};

// Fungsi untuk mengubah foto profile user dengan role dosen
const updatePhotoProfileUserWithRoleDosen = async (req, res) => {
  const { id } = req.params;

  // Query untuk mendapatkan data profile user dengan role dosen berdasarkan id
  const profile = await prisma.profile_images.findUnique({
    where: {
      id_user: id,
    },
  });

  // Jika data profile user dengan role dosen tidak ditemukan
  if (!profile) return res.status(404).json({ msg: "Data profile tidak ditemukan" });

  const file = req.file;

  // Jika file kosong
  if (file == null) {
    profile.image_name;
  }

  const ext = path.extname(file.originalname).toLowerCase();
  const filename = md5(file.originalname) + ext;

  // Jika foto profil user dengan role dosen sudah ada
  if (profile.image_name !== null) {
    const outFilePath = `public/img/profiles/${req.userId}/${profile.image_name}`;
    fs.unlinkSync(outFilePath);
  }

  const inFilePath = `public/img/profiles/${req.userId}/${filename}`;

  const url = `${req.protocol}://${req.get("host")}/img/profiles/${req.userId}/${filename}`;

  // Fungsi untuk mendapatkan ukurang file
  let stats = fs.statSync(inFilePath);
  let inFileSizeInBytes = stats.size;

  try {
    // Query untuk mengubah foto profil user dengan role dosen
    await prisma.profile_images
      .updateMany({
        where: {
          id: profile.id,
        },
        data: {
          image_name: filename,
          image_path: `/img/profiles/${req.userId}/${filename}`,
          image_size: inFileSizeInBytes,
          image_url: url,
          image_mimetype: ext,
        },
      })
      .then((result) => {
        res.set({
          "content-Type": "multipart/form-data",
        });

        // Jika berhasil mengubah foto profil user dengan role dosen
        response(200, result, {}, "Profile berhasil diubah", res);
      }) // Jika terjadi kesalahan saat mendapatkan data materi kuliah
      .catch((err) => {
        throw {
          code: 400,
          message: "Terjadi kesalahan saat mengubah foto profile user dengan role dosen",
          detailError: err.message,
        };
      })
      // Jika sudah selesai, maka tutup koneksi ke database
      .finally(async () => {
        await prisma.$disconnect();
      });
  } catch (error) {
    response(400, error, {}, error.message, res);
  }
};

// Fungsi untuk mengubah password user dengan role dosen
const updatePasswordUserWithRoleDosen = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { id } = req.params;

    // Query untuk mendapatkan data user dengan role dosen berdasarkan id
    await prisma.users
      .findFirst({
        where: {
          id: id,
        },
      })
      .then(async (result) => {
        // Bandingkan password yang diinputkan dengan password yang tersimpan di database
        const isCompare = bcrypt.compareSync(oldPassword, result.password);

        // Jika password lama yang diinputkan tidak sesuai dengan password yang tersimpan di database
        if (!isCompare) return response(401, [], {}, "Password lama yang Anda masukkan salah", res);

        // Enkripsi password baru
        const newPass = bcrypt.hashSync(newPassword, 10);

        // Query untuk mengubah password user dengan role dosen
        await prisma.users
          .update({
            where: {
              id: id,
            },
            data: {
              password: newPass,
            },
          })
          .then((result) => {
            response(200, result, {}, "Password berhasil diubah", res);
          }) // Jika terjadi kesalahan saat mendapatkan data materi kuliah
          .catch((err) => {
            throw {
              code: 400,
              message: "Terjadi kesalahan saat mengedit password",
              detailError: err.message,
            };
          })
          // Jika sudah selesai, maka tutup koneksi ke database
          .finally(async () => {
            await prisma.$disconnect();
          });
      });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      detailError: error.detailError,
    });
  }
};

module.exports = {
  getAllUsersWithRoleDosen,
  deleteUserWithRoleDosen,
  searchUsersWithRoleDosen,
  updateInformationProfileUserWithRoleDosen,
  updatePhotoProfileUserWithRoleDosen,
  updatePasswordUserWithRoleDosen,
};
