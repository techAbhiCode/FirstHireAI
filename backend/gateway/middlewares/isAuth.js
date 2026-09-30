import redis from "../../shared/redis/redis.js";


export const isAuth = async (
  req,
  res,
  next
) => {

  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const sessionId = req.cookies?.session || bearerToken || req.headers["x-session-id"];

    if (!sessionId) {
      return res
        .status(401)
        .json({
          message:
            "Unauthorized",
        });
    }

    const session =
      await redis.get(
        `session:${sessionId}`
      );

    if (!session) {

      return res
        .status(401)
        .json({
          message:
            "Session Expired",
        });

    }

    req.user =
      JSON.parse(session);

    next();

  } catch (error) {

    return res
      .status(500)
      .json({
        message:
          error.message,
      });

  }

};