const response = (statusCode, data, meta, message, res) => {
  res.status(statusCode).json({
    payload: data,
    meta,
    message,
  });
};

module.exports = response;
