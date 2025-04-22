export const responseTimeMiddleware = (req, res, next) => {
  req.startTime = new Date();
  next();
};
