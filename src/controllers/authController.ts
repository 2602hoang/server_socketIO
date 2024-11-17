import { Request, Response } from "express";
import Users from "../modules/Users";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response): Promise<void> => {
  const { username, phoneNumber, email, password } = req.body;

  try {
    const existingUser = await Users.findOne({
      $or: [{ phoneNumber }, { email }],
    });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new Users({
      username,
      phoneNumber,
      email,
      password: passwordHash,
    });

    await newUser.save();

    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred", error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await Users.findOne({ email });
    if (!user) {
      res.status(200).json({ message: "User does not exist", status: 1 });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(200).json({ message: "Incorrect password", status: 2 });
      return;
    }

    const accessToken = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    const refreshToken = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: "30d" }
    );

    user.lastLogin = new Date();
    user.isOnline = true;
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isOnline: user.isOnline,
        lastLogin: user.lastLogin,
      },
      message: "Login successful",
      status: 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred", error, status: 3 });
  }
};

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(401).json({ message: "Refresh token not provided" });
    return;
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as { id: string };
    const user = await Users.findById(decoded.id);

    if (!user) {
      res.status(403).json({ message: "Invalid refresh token" });
      return;
    }

    if (user.refreshToken !== refreshToken) {
      user.lastLogin = new Date();
      user.isOnline = false;
      await user.save();
      res.status(403).json({ message: "Invalid refresh token" });
      return;
    }

    const accessToken = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );

    res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    if (error instanceof jwt.TokenExpiredError) {
      const user = await Users.findOne({ refreshToken });
      if (user) {
        user.lastLogin = new Date();
        user.isOnline = false;
        await user.save();
      }
    }
    res.status(403).json({ message: "Refresh token is invalid or expired" });
  }
};
export const logout = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  try {
    const user = await Users.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    // user.lastLogin = new Date();
    user.isOnline = false;
    user.refreshToken = undefined;
    await user.save();
    res.status(200).json({
      message: "User logged out successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isOnline: user.isOnline,
        lastLogin: user.lastLogin,
      },
    });
    return;
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "An error occurred during logout", error });
  }
};
