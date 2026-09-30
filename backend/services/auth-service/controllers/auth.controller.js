import crypto from "crypto";

import { getAuth } from "firebase-admin/auth";

import { app } from "../configs/firebase.js";
import User from "../model/user.model.js";
import redis from "../../../shared/redis/redis.js";
import { parseFirebaseUserFromToken } from "../utils/firebaseToken.js";


export const login = async (req, res) => {

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    let decoded;

    try {
      decoded = await getAuth(app).verifyIdToken(token);
    } catch (firebaseError) {
      decoded = parseFirebaseUserFromToken(token);

      if (!decoded?.uid) {
        return res.status(401).json({
          message: "Unable to verify Firebase token",
          details: firebaseError.message,
        });
      }
    }

    let user = await User.findOne({
      firebaseUid: decoded.uid,
    });

    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        email: decoded.email || null,
        name: decoded.name || decoded.email?.split("@")[0] || "User",
      });
    }

    const sessionId =crypto.randomUUID();

    await redis.set(`session:${sessionId}`, JSON.stringify({
        userId:
        user._id,

        name:
        user.name,

        email:
        user.email,

        interviewCoin:
        user.interviewCoin
      }),"EX", 60 * 60 * 24 * 7);

    res.cookie("session", sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: "/",
    });

    return res.json({ success: true, user, sessionId });

  } catch (error) {

    return res.status(401).json({ message: error.message });

  }

};

const getSessionId = (req) => {
  const authHeader = req.headers?.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  return req.cookies?.session || bearerToken || req.headers?.["x-session-id"];
};

export const logout = async (req, res) => {
  try {

    const sessionId = getSessionId(req);

    if (sessionId) {
      await redis.del(`session:${sessionId}`);
    }

    res.clearCookie("session", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    return res.json({
      success: true,
      message: "Logged out successfully",
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
export const useInterviewCoins = async (req, res) => {
  try {
    const sessionId = getSessionId(req);

    const session = await redis.get(`session:${sessionId}`)

    const sessionData = JSON.parse(session);

    const { coins, action } = req.body;

    if (!coins) {
      return res.status(400).json({ 
        success: false,
        message: "Coins are required",
      });
    }

    const user = await User.findById(sessionData.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Not enough coins
    if (user.interviewCoin < coins) {
      return res.status(403).json({
        success: false,
        message: "Not enough interview coins",
        interviewCoin: user.interviewCoin,
      });
    }

    // Deduct coins
    user.interviewCoin -= coins;

    await user.save();
    await redis.set(`session:${sessionId}`, JSON.stringify({
        userId:
        user._id,

        name:
        user.name,

        email:
        user.email,

        interviewCoin:
        user.interviewCoin

      }),"EX", 60 * 60 * 24 * 7);


    return res.status(200).json({
      success: true,
      message: "Interview coins updated successfully",
      action,
      interviewCoin: user.interviewCoin,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};




export const addCoins = async (req, res) => {
  try {
    const sessionId = getSessionId(req);

    const session = await redis.get(`session:${sessionId}`);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Session expired",
      });
    }

    const sessionData = JSON.parse(session);

    const { coins } = req.body;

    if (!coins || coins <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid coins are required",
      });
    }

    const user = await User.findById(sessionData.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.interviewCoin += Number(coins);

    await user.save();

    // Update Redis Session
    await redis.set(
      `session:${sessionId}`,
      JSON.stringify({
        userId: user._id,
        name: user.name,
        email: user.email,
        interviewCoin: user.interviewCoin,
      }),
      "EX",
      60 * 60 * 24 * 7
    );

    return res.status(200).json({
      success: true,
      message: "Coins added successfully",
      interviewCoin: user.interviewCoin,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};