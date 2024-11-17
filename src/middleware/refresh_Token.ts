import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Users from "../modules/Users";

export const refreshTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET as string, async (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        const refreshToken = req.body.refreshToken;

        if (!refreshToken) {
          return res
            .status(401)
            .json({ message: "Refresh token không được cung cấp" });
        }

        try {
          const decodedRefresh = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET as string
          ) as { id: string };

          const user = await Users.findById(decodedRefresh.id);
          if (!user || user.refreshToken !== refreshToken) {
            return res
              .status(403)
              .json({ message: "Refresh token không hợp lệ" });
          }

          const newAccessToken = jwt.sign(
            { id: user._id.toString() },
            process.env.JWT_SECRET as string,
            { expiresIn: "10s" } // Thời gian hết hạn access token
          );

          res.setHeader("Authorization", `Bearer ${newAccessToken}`);
          return next();
        } catch (refreshError) {
          return res
            .status(403)
            .json({ message: "Refresh token không hợp lệ" });
        }
      }

      return res.status(403).json({ message: "Token không hợp lệ" });
    }

    next();
  });
};
