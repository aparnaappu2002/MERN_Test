import { useMutation,useQuery } from "@tanstack/react-query";
import { registerUser,loginUser,uploadToCloudinary,uploadAudioToCloudinary,submitKyc,getKycStatus,getDashboardUsers} from "../services/userService";

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      return await registerUser(email, password);
    },
  });
};

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      return await loginUser(email, password);
    },
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
    },
  });
};

export const useUploadToCloudinaryMutation = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      return await uploadToCloudinary(formData);
    },
    throwOnError: false,
  });
};

export const useUploadAudioMutation = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => uploadAudioToCloudinary(formData),
    throwOnError: false,
  });
};

export const useSubmitKycMutation = () => {
  return useMutation({
    mutationFn: async ({ imageUrl, audioUrl }: { imageUrl: string; audioUrl: string }) => {
      return await submitKyc(imageUrl, audioUrl);
    },
    throwOnError: false,
  });
};

export const useGetKycStatusQuery = () => {
  return useQuery({
    queryKey: ["kycStatus"],
    queryFn: async () => await getKycStatus(),
    retry: false,
  });
};


export const useGetDashboardQuery = (page: number, search: string) => {
  return useQuery({
    queryKey: ["dashboard", page, search], 
    queryFn: async () => await getDashboardUsers(page, search),
    retry: false,
  });
};