const w2v = require("word2vec");
const response = require("../utils/response");
const { removeStopwords, ind } = require("stopword");
const sastrawi = require("sastrawijs");
const prisma = require("../configs/prisma");
const uniqueId = require("../utils/generateUniqueId");

// Deklarasi variabel model
let model;

// Fungsi untuk memuat model Word2Vec
const loadModelWord2vec = async (req, res) => {
  const modelFile = req.body.modelFile;

  if (!modelFile) {
    return response(400, [], {}, "Pilih model word2vec terlebih dahulu", res);
  }

  const filePath = modelFile;

  if (!filePath) {
    return response(400, [], {}, "Direktori file tidak ditemukan", res);
  }

  w2v.loadModel(filePath, function (err, result) {
    if (err) {
      res.status(400).json({ message: "Error loading Word2Vec model:", err });
    } else {
      // Model loaded successfully
      res.status(200).json({ message: "Model berhasil dimuat" });
      model = result;
    }
  });
};

// Fungsi untuk memeriksa kesamaan jawaban mahasiswa dengan kunci jawaban
const similarityChecker = async (req, res) => {
  // Deklarasi input dari body
  const { answer_key, student_answer, student_nim, student_class, exam_name, question_number } =
    req.body;

  // Cek apakah model sudah dimuat
  if (!model) {
    return res.status(400).json({ message: "Muat model terlebih dahulu!" });
  }

  // Kalkulasi nilai kesamaan
  const similarity = calculateSimilarity(answer_key, student_answer);

  // Cek apakah nilai kesamaan tersedia
  if (similarity === null) {
    return response(400, [], {}, "Nilai kesamaan tidak tersedia", res);
  } else {
    // Simpan nilai kesamaan ke database
    await prisma.similarity
      .create({
        data: {
          id: await uniqueId(),
          id_user: req.userId,
          student_nim: student_nim,
          student_class: student_class,
          exam_name: exam_name,
          question_number: question_number,
          student_answer: student_answer,
          total_score: similarity,
        },
      })
      .then((result) => {
        return response(
          200,
          { similarity: similarity, result },
          {},
          "Nilai kesamaan tersedia",
          res
        );
      })
      .catch((error) => {
        return res.status(500).json({
          message: error.message,
          detailError: error.detailError,
        });
      });
  }
};

// Fungsi untuk menghitung kesamaan kosinus antara jawaban mahasiswa dengan kunci jawaban dari jarak Word Mover`s Distance
function calculateSimilarity(answer_key, student_answer) {
  const score1 = wordMover(answer_key);
  const score2 = wordMover(student_answer);
  const dist = Math.sqrt((score1 - score2) * (score1 - score2));
  const similarity = 1 - dist;
  return similarity;
}

// Fungsi untuk menghitung jarak Word Mover`s Distance antara dua teks
function wordMover(text) {
  // Deklarasi variabel
  let dist = 0;
  let stemmedWords = [];

  // Mengubah teks menjadi huruf kecil
  let lText = text.toLowerCase();

  // Menghapus karakter khusus, URL, dan emotikon menggunakan regex
  lText = lText.replace(/[^a-zA-Z0-9 ]/g, ""); // Regex menghapus spesial character
  lText = lText.replace(/(?:https?|ftp):\/\/[\n\S]+/g, ""); // Regex menghapus URL
  lText = lText.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
    ""
  ); // Regex menghapus emot

  // Proses tokenisasi
  let arrText = lText.trim().split(/\s+|\./);

  // Menghapus kata-kata umum (stop words) dalam bahasa Indonesia
  const filteredWords = removeStopwords(arrText, ind);

  // Proses stemming kata-kata
  const stemmer = new sastrawi.Stemmer();

  for (let filteredWord of filteredWords) {
    stemmedWords.push(stemmer.stem(filteredWord));
  }

  // Jumlah pasangan kata yang dibandingkan
  let totalPairs = stemmedWords.length;

  // Menghitung jarak Word Mover`s Distance
  for (let i = 1; i < stemmedWords.length; i++) {
    let word1 = stemmedWords[i - 1];
    let word2 = stemmedWords[i];

    let similarity = model.similarity(word1, word2);
    dist += similarity;
  }

  let averageSimilarity = dist / totalPairs;
  let score = 1 - averageSimilarity; // Konversi ke skor similarity dalam rentang 0 - 1

  return score;
}
module.exports = { loadModelWord2vec, similarityChecker };
