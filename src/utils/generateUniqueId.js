const NanoidAsync = require("nanoid/async");

const uniqueId = async () => {
  const nanoid = await NanoidAsync.nanoid(10);
  return nanoid;
};

module.exports = uniqueId;
