const IMGBB_ENDPOINT = "https://api.imgbb.com/1/upload";

async function postToImgBB(base64OrFile, filename = "upload") {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) throw new Error("IMGBB_API_KEY is not configured");

  let base64;
  if (typeof base64OrFile === "string") {
    base64 = base64OrFile.replace(/^data:image\/\w+;base64,/, "");
  } else if (base64OrFile instanceof Blob || base64OrFile?.arrayBuffer) {
    const buffer = Buffer.from(await base64OrFile.arrayBuffer());
    base64 = buffer.toString("base64");
  } else {
    throw new Error("Unsupported image input");
  }

  const formData = new FormData();
  formData.append("key", apiKey);
  formData.append("image", base64);
  formData.append("name", filename);

  const res = await fetch(IMGBB_ENDPOINT, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error?.message || "ImgBB upload failed");
  }
  return data.data;
}

export async function uploadToImgBB(base64OrFile, filename = "upload") {
  const data = await postToImgBB(base64OrFile, filename);
  return data.display_url || data.url;
}

// Returns the full set of ImgBB URLs (original, medium, thumb, delete page).
export async function uploadToImgBBDetailed(base64OrFile, filename = "upload") {
  const data = await postToImgBB(base64OrFile, filename);
  const url = data.image?.url || data.url || data.display_url;
  return {
    id: data.id || "",
    url,
    displayUrl: data.display_url || url,
    mediumUrl: data.medium?.url || data.display_url || url,
    thumbUrl: data.thumb?.url || data.medium?.url || data.display_url || url,
    deleteUrl: data.delete_url || "",
    width: Number(data.width) || 0,
    height: Number(data.height) || 0,
  };
}

export async function uploadFormFileToImgBB(file) {
  if (!file) return null;
  return uploadToImgBB(file, file.name);
}
