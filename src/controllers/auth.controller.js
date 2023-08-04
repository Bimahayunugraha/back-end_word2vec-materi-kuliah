const response = require("../utils/response");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../configs/prisma");
const nodemailer = require("nodemailer");

const clientURL = process.env.CLIENT_URL;
const userEmail = process.env.USER_EMAIL;
const userPassword = process.env.USER_PASSWORD;
const envRefreshToken = process.env.REFRESH_TOKEN_SECRET;
const envAccessToken = process.env.ACCESS_TOKEN_SECRET;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: userEmail,
    pass: userPassword,
  },
});

// Fungsi untuk menjalankan refresh token jika token sudah kadaluwarsa
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: requestToken } = req.body;
    if (requestToken == null) {
      return res.status(403).json({ message: "Refresh Token is required!" });
    }

    await prisma.users
      .findFirst({
        where: {
          refresh_token: requestToken,
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
      })
      .then((result) => {
        // Jika user tidak ditemukan
        if (!result) return response(403, result, {}, "User tidak ditemukan", res);

        // Jika user ditemukan, maka lakukan verifikasi token
        jwt.verify(requestToken, envRefreshToken, async (err) => {
          if (err) return response(403, [], {}, "Refresh token tidak valid", res);
          const id = result.id;
          const role = result.roles.role_name;
          const name = result.name;
          const username = result.username;
          const email = result.email;
          const profile = result.profile_images.image_url;

          // Buat token baru
          const accessToken = jwt.sign(
            { id, role, name, username, email, profile },
            envAccessToken,
            {
              expiresIn: "10m",
            }
          );

          // Buat refresh token baru
          const refreshToken = jwt.sign(
            { id, role, name, username, email, profile },
            envRefreshToken,
            {
              expiresIn: "7d",
            }
          );

          // Simpan refresh token baru ke database
          await prisma.users.update({
            where: {
              id: id,
            },
            data: { refresh_token: refreshToken },
          });

          // Kirim response ke klien
          res.status(200).json({
            payload: {
              id: id,
              role: role,
              name: name,
              email: email,
              username: username,
              profile: profile,
            },
            access_token: accessToken,
            refresh_token: refreshToken,
            message: "Refresh token berhasil di update",
          });
        });
      })
      // Jika terjadi error
      .catch((error) => {
        response(400, [], {}, error.message, res);
      })
      .finally(async () => {
        await prisma.$disconnect();
      });
  } catch (error) {
    response(400, [], {}, error.message, res);
  }
};

// Fungsi untuk login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cek apakah email dan password kosong
    if (!email || !password) {
      throw {
        code: 404,
        message: "Isi data yang kosong!",
      };
      // Jika email dan password tidak kosong
    } else {
      // Cari user berdasarkan email
      await prisma.users
        .findFirst({
          where: {
            email: email,
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
        })
        .then(async (result) => {
          // Jika user tidak ditemukan
          if (!result) {
            throw {
              code: 401,
              message: "User tidak ditemukan",
            };
            // Jika user ditemukan
          } else {
            // Bandingkan password yang diinputkan dengan password yang tersimpan di database
            const isCompare = bcrypt.compareSync(password, result.password);

            // Jika password tidak cocok
            if (!isCompare) return response(401, [], {}, "Password yang Anda masukkan salah", res);

            const id = result.id;
            const role = result.roles.role_name;
            const name = result.name;
            const username = result.username;
            const email = result.email;
            const profile = result.profile_images.image_url;

            // Buat token baru
            const accessToken = jwt.sign(
              { id, role, name, username, email, profile },
              envAccessToken,
              {
                expiresIn: "10m",
              }
            );

            // Buat refresh token baru
            const refreshToken = jwt.sign(
              { id, role, name, username, email, profile },
              envRefreshToken,
              {
                expiresIn: "7d",
              }
            );

            const expAccessToken = jwt.decode(accessToken);
            const expRefreshToken = jwt.decode(refreshToken);

            // Simpan refresh token baru ke database
            await prisma.users.update({
              where: {
                id: id,
              },
              data: { refresh_token: refreshToken },
            });

            // Kirim response ke klien
            res.status(200).json({
              payload: {
                id: id,
                role: role,
                name: name,
                email: email,
                username: username,
                profile: profile,
              },

              access_token: accessToken,
              exp_access: expAccessToken.exp,
              refresh_token: refreshToken,
              exp_refresh: expRefreshToken.exp,
              message: "Login berhasil",
            });
          }
        });
    }
    // Jika terjadi error
  } catch (err) {
    return response(
      400,
      [],
      {},
      "Anda belum memiliki akun, silahkan meminta admin untuk mendaftarkan terlebih dahulu!",
      res
    );
  } finally {
    await prisma.$disconnect();
  }
};

// Fungsi untuk meminta link atur ulang password
const requestResetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Cek apakah email kosong
    if (!email) {
      throw {
        code: 404,
        message: "Masukkan email Anda!",
      };
      // Jika email tidak kosong
    } else {
      // Cari user berdasarkan email
      await prisma.users
        .findFirst({
          where: {
            email: email,
          },
        })
        .then(async (result) => {
          // Jika user tidak ditemukan
          if (!result) {
            throw {
              code: 401,
              message: "User tidak ditemukan",
            };
            // Jika user ditemukan
          } else {
            // Cari token yang sudah digunakan
            const token = await prisma.password_reset_tokens.findUnique({
              where: {
                id_user: result.id,
              },
            });

            // Jika token sudah digunakan, hapus token yang sudah digunakan
            if (token)
              await prisma.password_reset_tokens.delete({
                where: {
                  id_user: result.id,
                },
              });

            // Buat token baru
            const resetToken = jwt.sign({ id: result.id }, envAccessToken, {
              expiresIn: "1h",
            });

            // Simpan token baru untuk atur ulang password ke database
            await prisma.password_reset_tokens.create({
              data: {
                id_user: result.id,
                token: resetToken,
                used: 0,
              },
            });

            const link = `${clientURL}/resetPassword?token=${resetToken}&id=${result.id}`;

            // Kirim email ke user
            const mailOptions = {
              from: process.env.USER_EMAIL,
              to: email,
              subject: "Mengirim Tautan Untuk Atur Ulang Password",
              html: `<!DOCTYPE html>
              <html lang="en" >
              <head>
                <meta charset="UTF-8">
                <title>Atur Ulang Password</title>
                

              </head>
              <body>
              <!-- partial:index.partial.html -->
              <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                <div style="margin:50px auto;width:70%;padding:20px 0">
                  <div style="border-bottom:1px solid #eee">
                    <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Word2vec Materi Kuliah</a>
                  </div>
                  <p style="font-size:1.1em">Hi, ${result.name}</p>
                  <p>Anda meminta untuk mengatur ulang kata sandi. Silahkan, klik tautan di bawah ini untuk mengatur ulang kata sandi Anda. Tautan atur ulang password berlaku selama 1 jam.</p>
                  <a href=${link} style="background: #00466a;margin: 0 auto;width: max-content;padding: 10px 10px;color: #fff;border-radius: 4px;display:flex;justify-content:center;align-items:center;">Atur Ulang Password</a>
                  <p style="font-size:0.9em;">Regards,<br />Admin</p>
                  <hr style="border:none;border-top:1px solid #eee" />
                  <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                    <p>Word2vec Materi Kuliah</p>
                    <p>Kampus Terpadu UMY</p>
                    <p>Jl. Brawijaya, Kasihan, Bantul Yogyakarta 55183</p>
                  </div>
                </div>
              </div>
              <!-- partial -->
                
              </body>
              </html>`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.log("error", error);
                res.status(401).json({ status: 401, message: "email not send" });
              } else {
                console.log("Email sent", info.response);
                res.status(201).json({ status: 201, message: "Email sent Succsfully" });
              }
            });
          }
        })
        // Jika terjadi error
        .catch((err) => {
          throw {
            code: 500,
            message:
              "Email yang Anda masukkan tidak terdaftar, silahkan masukkan email yang terdaftar atau hubungi admin untuk mendaftarkan terlebih dahulu!",
            detailError: err.message,
          };
        });
    }
  } catch (err) {
    return res.status(400).json({
      message: err.message,
      detailError: err.detailError,
    });
  }
};

// Fungsi untuk verifikasi token atur ulang password
const verifyUserResetToken = async (req, res) => {
  try {
    const { token, id } = req.params;

    // Cari user dan token yang sesuai
    const validUser = await prisma.password_reset_tokens.findFirst({
      where: {
        id_user: id,
        token: token,
      },
    });

    // Verifikasi token yang digunakan
    const verifyToken = jwt.verify(token, envAccessToken);

    // Jika token valid
    if (validUser && verifyToken.id) {
      response(201, validUser, {}, "Token valid", res);
      // Jika token tidak valid
    } else {
      response(401, [], {}, "Token tidak valid atau kadaluwarsa", res);
    }
    // Jika terjadi error
  } catch (err) {
    response(400, err, {}, "Token tidak valid atau kadaluwarsa", res);
  }
};

// Fungsi untuk mengatur ulang password
const resetPassword = async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  try {
    // Cari user dan token yang sesuai
    const passwordResetToken = await prisma.password_reset_tokens.findFirst({
      where: {
        id_user: id,
        token: token,
      },
    });

    // Verifikasi token yang digunakan, jika token tidak valid maka kirim response error
    if (!passwordResetToken)
      return res.status(401).json({ message: "Token tidak valid atau kadaluwarsa" });

    // Verifikasi token yang digunakan, jika token valid maka lanjutkan proses reset password
    const verifyToken = jwt.verify(token, envAccessToken);

    // Jika token valid
    if (passwordResetToken && verifyToken.id) {
      // Enkripsi password baru
      const newpassword = bcrypt.hashSync(password, 10);

      // Simpan password baru ke database
      await prisma.users
        .update({
          where: {
            id: id,
          },
          data: {
            password: newpassword,
          },
        })
        .then((result) => {
          response(200, result, {}, "Password berhasil direset", res);
        });

      // Ubah status token menjadi sudah digunakan
      await prisma.password_reset_tokens.update({
        where: {
          id_user: id,
        },
        data: {
          used: 1,
        },
      });

      // Kirim email ke user
      await prisma.users
        .findUnique({
          where: {
            id: id,
          },
        })
        .then((result) => {
          const mailOptions = {
            from: process.env.USER_EMAIL,
            to: result.email,
            subject: "Kata Sandi Berhasil Di Atur Ulang",
            html: `<!DOCTYPE html>
              <html lang="en" >
              <head>
                <meta charset="UTF-8">
                <title>Atur Ulang Password</title>
                

              </head>
              <body>
              <!-- partial:index.partial.html -->
              <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                <div style="margin:50px auto;width:70%;padding:20px 0">
                  <div style="border-bottom:1px solid #eee">
                    <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Word2vec Materi Kuliah</a>
                  </div>
                  <p style="font-size:1.1em">Hi, ${result.name}</p>
                  <p>Kata sandi Anda telah berhasil di atur ulang. Lanjutkan penjelahan Anda di Website Word2vec Materi Kuliah. Terima kasih...</p>
                  <p style="font-size:0.9em;">Regards,<br />Admin</p>
                  <hr style="border:none;border-top:1px solid #eee" />
                  <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                    <p>Word2vec Materi Kuliah</p>
                    <p>Kampus Terpadu UMY</p>
                    <p>Jl. Brawijaya, Kasihan, Bantul Yogyakarta 55183</p>
                  </div>
                </div>
              </div>
              <!-- partial -->
                
              </body>
              </html>`,
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log("error", error);
              res.status(401).json({ status: 401, message: "email not send" });
            } else {
              console.log("Email sent", info.response);
              res.status(201).json({ status: 201, message: "Email sent Succsfully" });
            }
          });
        });
      // Jika terjadi error
    } else {
      res.status(401).json({ status: 401, message: "User tidak ditemukan" });
    }
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      detailError: error.detailError,
    });
  }
};

module.exports = { login, refreshToken, requestResetPassword, verifyUserResetToken, resetPassword };
