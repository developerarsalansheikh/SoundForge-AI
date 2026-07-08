import axiosInstance from "./axiosInstance";

export const getMySongs = async (params = {}) => {
  const res = await axiosInstance.get("/api/songs", { params });
  return res.data;
};

export const getSongById = async (id) => {
  const res = await axiosInstance.get(`/api/songs/${id}`);
  return res.data;
};

export const deleteSong = async (id) => {
  const res = await axiosInstance.delete(`/api/songs/${id}`);
  return res.data;
};

export const toggleFavorite = async (id) => {
  const res = await axiosInstance.patch(`/api/songs/${id}/favorite`);
  return res.data;
};

export const getSongStats = async () => {
  const res = await axiosInstance.get("/api/songs/stats");
  return res.data;
};

export const getDownloadUrl = (id) => {
  // Return the direct download endpoint URL.
  // Note: axiosInstance requests carry the auth token in header,
  // but a direct browser link download requires a query token or using fetch.
  // We will download using fetch/blob in the UI or direct browser link if authenticated via query,
  // or simple window.open if cookies/session allows, but a blob download via axios is more secure.
  return `/api/songs/${id}/download`;
};
