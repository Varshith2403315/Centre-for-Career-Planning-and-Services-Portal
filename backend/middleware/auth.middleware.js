// middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import pool from "../config/postgredb.js";
import CallLog from "../models/callLog.model.js";
import HRContact from "../models/hrContact.model.js";

config();

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("Token: ", token);

    if (!token) {
      return res.status(401).json({ success: false, message: "Not Authorized. Token not found" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // Handle token errors separately
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    console.log("Decoded Token: ", decoded);

    if (!decoded?.userId) {
      return res.status(401).json({ success: false, message: "Not Authorized. Token invalid" });
    }

    // Fetch user from PostgreSQL
    const query = `SELECT user_id, full_name, email, role FROM users WHERE user_id = $1`;
    const { rows } = await pool.query(query, [decoded.userId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    req.user = rows[0];
    req.userId = rows[0].user_id; // UUID
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (
      !req.user ||
      !roles.map(r => r.toLowerCase()).includes(req.user.role.toLowerCase())
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    next();
  };
};



export const authorizeUpdateLog = async (req, res, next) => {
  try {
    const log = await CallLog.getLogById(req.params.id);
    if (!log) return res.status(404).json({ success: false, message: "Log not found" });
    const isAdmin = req.user.role === "admin";
    const isOwner = req.user.user_id === log.caller_id;
    const iseligibleOwner = req.user.user_id === log.caller_id && log.call_timestamp > Date.now() - 24*60*60*1000;

    if( isAdmin || iseligibleOwner ){
      next();
    }
    else if(isOwner){
      return res.status(403).json({ success: false, message: "You can modify within only 24Hrs" });
    }
    else{
      return res.status(403).json({ success: false, message: "Access denied" });
    }
  } catch (error) {
    console.error("Error in authorizeUpdateLog middleware: ", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};




export const createLogAuthorization = async (req, res, next) => {
  try {
    const { contact_id } = req.body;

    if (!contact_id) {
      return res.status(400).json({ success: false, message: "contact_id is required" });
    }

    const contact = await HRContact.getHRContactById(contact_id);

    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }

    // Check assigned HR
    if (contact.assigned_to_user_id !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to add log for this contact",
      });
    }

    next();
  } catch (error) {
    console.error("Error in createLogAuthorization middleware:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};



export const trackActivity = async (req, res, next) => {
  if (req.user) {
    try {
      await pool.query(
        `UPDATE users SET last_active_at = NOW() WHERE user_id = $1`,
        [req.user.user_id]
      );
    } catch (err) {
      console.error("Error updating last_active_at:", err.message);
    }
  }
  next();
};