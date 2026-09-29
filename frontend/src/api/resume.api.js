import axios from "axios";
import api from "../utils/axios";


export const getResume = async () => {
  try {
    const response = await api.get("/api/resume/get-resume");
    return response?.data ?? null;
  } catch (error) {
    console.warn("Resume API error:", error?.response?.data || error?.message || error);
    return null;
  }
};