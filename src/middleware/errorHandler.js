const { logRequest } = require('../services/logService');

async function errorHandler(err, req, res, next) {
  console.error('Error caught by middleware:', err);

  try {
    const safeHeaders = { ...req.headers };
    delete safeHeaders.authorization;

    await logRequest({
      request: {
        path: req.path,
        body: req.body,
        headers: safeHeaders,
        method: req.method,
      },
      response: null,
      error: err.message,
      platform: req.body.platform || null,
      processingTimeMs: null,
    });
  } catch (logError) {
    console.error('Failed to log error:', logError);
  }

  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
}

module.exports = { errorHandler };
