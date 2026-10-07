
export function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}export function errorHandler(err, req, res, next) {
  console.error(`[error] ${req.method} ${req.originalUrl}:`, err.message);  const status = err.serverSelectionError || err.code === "ENOENT" ? 503 : err.statusCode || 500;

  res.status(status).json({
    error: status === 500 ? "Internal server error" : err.message,
  });
}
