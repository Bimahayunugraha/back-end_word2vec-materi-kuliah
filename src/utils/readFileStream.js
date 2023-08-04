const fs = require("fs-extra");
const readline = require("readline");

const readFileStream = (filePath, res) => {
  const readStream = fs.createReadStream(filePath);
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
    readStream.end();
    res.sendStatus(200).json({ payload: lines, message: "Berhasil membaca file" });
  });
};

module.exports = readFileStream;
