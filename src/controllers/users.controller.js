const response = require("../utils/response");
const bcrypt = require("bcryptjs");
const prisma = require("../configs/prisma");
const path = require("path");
const fs = require("fs-extra");
const uniqueId = require("../utils/generateUniqueId");

// Fungsi untuk menambahkan data user
const addNewUser = async (req, res) => {
  try {
    const { id_role, name, username, email, phone, password } = req.body;

    // Jika data user kosong
    if ((!id_role, !name || !username || !email || !phone || !password))
      return response(400, [], "Isi data yang kosong!", res);

    // Enkripsi password
    let hashPassword = bcrypt.hashSync(password, 10);

    // Query untuk mengecek apakah username, email, nomor telepon, atau password sudah terdaftar atau belum
    const inUniqueRegister = await prisma.users.findFirst({
      where: {
        OR: [
          {
            name: name,
          },
          {
            username: username,
          },
          {
            email: email,
          },
          {
            phone: phone,
          },
          {
            password: password,
          },
        ],
      },
    });

    // Jika username, email, nomor telepon, atau password sudah terdaftar
    if (inUniqueRegister) {
      return response(
        403,
        { unique: true },
        {},
        "Username, email, nomor telepon, atau password sudah terdaftar. Silahkan gunakan data yang lain",
        res
      );
      // Jika username, email, nomor telepon, atau password belum terdaftar
    } else {
      await prisma.users
        .create({
          data: {
            id: await uniqueId(),
            id_role: id_role,
            name: name,
            username: username,
            email: email,
            phone: phone,
            password: hashPassword,
          },
        })
        // Jika berhasil menambahkan data user
        .then(async (result) => {
          const oldFilePath = "public/img/profile.png";

          // Fungsi untuk membuat folder baru jika folder belum ada
          if (!fs.existsSync(`public/img/profiles/${result.id}`)) {
            fs.mkdirSync(`public/img/profiles/${result.id}`, { recursive: true });
          }
          const newFilePath = `public/img/profiles/${result.id}/profile.png`;

          // Fungsi untuk menyalin file
          fs.copyFile(oldFilePath, newFilePath, function (err) {
            if (err) {
              console.error(err);
            }
          });

          const ext = path.extname(newFilePath);

          // Query untuk menambahkan data foto profil user
          await prisma.profile_images.create({
            data: {
              id: await uniqueId(),
              id_user: result.id,
              image_name: "profile.png",
              image_path: newFilePath,
              image_size: 19293,
              image_url: `${req.protocol}://${req.get("host")}/img/profiles/${
                result.id
              }/profile.png`,
              image_mimetype: ext,
            },
          });
          response(201, result, {}, "Berhasil menambahkan data user", res);
        })
        // Jika terjadi kesalahan saat menambahkan data user
        .catch((err) => {
          return res.status(500).json({
            message: err.message,
            detailError: err.detailError,
          });
        });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      detailError: error.detailError,
    });
  }
};

// Fungsi untuk mendapatkan data user berdasarkan id
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Query untuk mendapatkan data user berdasarkan id
    await prisma.users
      .findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
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
          name: true,
          username: true,
          email: true,
          phone: true,
        },
      })
      .then((result) => {
        // Jika data user tidak ditemukan
        if (!result) {
          return response(404, result, {}, "Data user kosong", res);
        }
        // Jika data user ditemukan
        return response(200, result, {}, "Berhasil mendapatkan data user", res);
      })
      // Jika terjadi kesalahan saat mendapatkan data user
      .catch((err) => {
        throw {
          code: 400,
          message: err.message,
          detailError: err.message,
        };
      })
      // Jika sudah selesai, maka tutup koneksi ke database
      .finally(async () => {
        await prisma.$disconnect();
      });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  getUserById,
  addNewUser,
};
