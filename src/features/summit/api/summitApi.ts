import api from "@/lib/axios";
import type { ApiResponse } from "@/types/common.types";
import type { PhotoVerifyResponse } from "../types/summit.types";

export const verifySummitWithPhoto = async (
  sessionId: number,
  latitude: number,
  longitude: number,
  photo: File
): Promise<PhotoVerifyResponse> => {
  const formData = new FormData();
  formData.append("photo", photo);
  formData.append("sessionId", String(sessionId));
  formData.append("latitude", String(latitude));
  formData.append("longitude", String(longitude));

  const res = await api.post<ApiResponse<PhotoVerifyResponse>>(
    "/summit/verify/photo",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return res.data.data;
};