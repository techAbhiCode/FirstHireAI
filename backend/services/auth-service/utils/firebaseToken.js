export const decodeFirebaseTokenPayload = (token) => {
  if (!token || typeof token !== "string") {
    return null;
  }

  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  const payload = parts[1]
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const normalized = payload.padEnd(Math.ceil(payload.length / 4) * 4, "=");

  try {
    return JSON.parse(Buffer.from(normalized, "base64").toString("utf8"));
  } catch {
    return null;
  }
};

export const parseFirebaseUserFromToken = (token) => {
  const payload = decodeFirebaseTokenPayload(token);

  if (!payload) {
    return null;
  }

  return {
    uid: payload.uid || payload.user_id || payload.sub,
    email: payload.email || null,
    name: payload.name || payload.given_name || payload.email?.split("@")[0] || null,
  };
};
