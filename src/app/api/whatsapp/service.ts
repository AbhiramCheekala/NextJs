import axios from "axios";

export const getTemplatesFromWABA = async (
  accessToken: string,
  wabaId: string
) => {
  const url = `https://graph.facebook.com/v19.0/${wabaId}/message_templates`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data.data; // list of templates
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message || "Failed to fetch templates"
      );
    } else {
      throw new Error("Failed to fetch templates");
    }
  }
};
