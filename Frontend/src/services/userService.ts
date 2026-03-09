import { userAxios } from "../axios/userAxios";
import clodAxios,{ isAxiosError } from 'axios'


const CLOUDINARY_URL = import.meta.env.VITE_CLOUDINARY_URL;
const CLOUDINARY_AUDIO_URL=import.meta.env.VITE_CLOUDINARY_AUDIO_URL

export const uploadToCloudinary = async (formData: FormData) => {
  try {
    const response = await clodAxios.post(CLOUDINARY_URL, formData);
    return response.data;
  } catch (error) {
    console.log("Error while uploading to Cloudinary", error);
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.error);
    }
    throw "Error while uploading to Cloudinary";
  }
};

export const uploadAudioToCloudinary = async (formData: FormData) => {
  try {
    const response = await clodAxios.post(CLOUDINARY_AUDIO_URL, formData); 
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.error?.message);
    }
    throw new Error("Error while uploading audio");
  }
};



export const registerUser = async (email: string, password: string) => {
  try {
    const response = await userAxios.post("/register", { email, password });
    return response.data;
  } catch (error) {
    console.error("Error while registering user", error);
    if (isAxiosError(error)) {
  console.log("error.response.data:", error.response?.data); // 👈 check this
  throw new Error(error.response?.data?.message);
}
    throw "Error while registering user";
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await userAxios.post("/login", { email, password });
    return response.data; 
  } catch (error) {
    console.error("Error while logging in user", error);
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.message);
    }
    throw "Error while logging in user";
  }
};

export const submitKyc = async (imageUrl: string, audioUrl: string) => {
  try {
    const response = await userAxios.post("/kyc", { imageUrl, audioUrl }); // ✅ matches backend
    return response.data;
  } catch (error) {
    console.error("Error while submitting KYC", error);
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "KYC submission failed");
    }
    throw new Error("Error while submitting KYC");
  }
};

export interface KycStatusResponse {
  kycStatus: "pending" | "submitted" | "verified";
}

export const getKycStatus = async (): Promise<KycStatusResponse> => {
  try {
    const response = await userAxios.get("/kyc-status");
    return response.data;
  } catch (error) {
    console.error("Error while fetching KYC status", error);
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to fetch KYC status");
    }
    throw new Error("Error while fetching KYC status");
  }
};

export interface DashboardResponse {
  users: {
    _id: string;
    email: string;
    kycStatus?: string;
    imageUrl?: string;   
    audioUrl?: string;   
    updatedAt?: string;  
  }[];
  total: number;
}


export const getDashboardUsers = async (
  page: number,
  search: string
): Promise<DashboardResponse> => {
  try {
    const response = await userAxios.get("/dashboard", {
      params: { page, search },
    });
    return response.data;
  } catch (error) {
    console.error("Error while fetching dashboard users", error);
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to fetch users");
    }
    throw new Error("Error while fetching dashboard users");
  }
};
