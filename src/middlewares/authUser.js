const jwt = require("jsonwebtoken");
const response = require("../utils/response");
const prisma = require("../configs/prisma");

// Fungsi untuk memverifikasi token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // Jika token kosong
  if (token == null) return response(401, [], {}, "Unauthorized", res);

  // Verifikasi token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return response(403, [], {}, "Token tidak valid", res);
    // req.user = user;
    req.email = decoded.email;
    req.name = decoded.name;
    req.userId = decoded.id;
    req.role = decoded.role;
    next();
  });
};

// Fungsi untuk membatasi akses hanya untuk admin
const adminOnly = async (req, res, next) => {
  // Query untuk mendapatkan data user berdasarkan id
  const user = await prisma.users.findUnique({
    where: {
      id: req.userId,
    },
    include: {
      roles: {
        select: {
          role_name: true,
        },
      },
    },
  });

  // Jika user tidak ditemukan
  if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

  // Jika user bukan admin
  if (user.roles.role_name !== "admin") return res.status(403).json({ msg: "Akses terlarang" });
  next();
};

module.exports = { adminOnly, verifyToken };
