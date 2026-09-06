const MAX_LENGTHS = {
  name: 100,
  email: 254,
  project: 120,
  message: 2400,
  website: 200,
};

function valueFrom(body, key) {
  const value = typeof body?.[key] === "string" ? body[key] : "";
  return value.replace(/\u0000/g, "").trim();
}

function isAllowedOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) return true;

  const protocol = String(request.headers["x-forwarded-proto"] || "https").split(",")[0];
  const ownOrigin = request.headers.host ? `${protocol}://${request.headers.host}` : "";
  const configuredOrigins = String(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return [ownOrigin, ...configuredOrigins].includes(origin);
}

function addCorsHeaders(request, response) {
  const origin = request.headers.origin;
  if (origin && isAllowedOrigin(request)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
  }
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(response, status, body) {
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  return response.status(status).json(body);
}

module.exports = async function contact(request, response) {
  addCorsHeaders(request, response);

  if (request.method === "OPTIONS") {
    return response.status(204).end();
  }

  if (request.method !== "POST") {
    return sendJson(response, 405, { ok: false, error: "Method not allowed" });
  }

  if (!isAllowedOrigin(request)) {
    return sendJson(response, 403, { ok: false, error: "Forbidden" });
  }

  const body = typeof request.body === "object" && request.body ? request.body : {};
  const name = valueFrom(body, "name");
  const email = valueFrom(body, "email");
  const project = valueFrom(body, "project");
  const message = valueFrom(body, "message");
  const website = valueFrom(body, "website");

  if (website) {
    // Honeypot: do not reveal to bots that their request was discarded.
    return sendJson(response, 200, { ok: true });
  }

  if (!name || !email || !project || !message) {
    return sendJson(response, 400, { ok: false, error: "Missing required fields" });
  }

  if (
    name.length > MAX_LENGTHS.name ||
    email.length > MAX_LENGTHS.email ||
    project.length > MAX_LENGTHS.project ||
    message.length > MAX_LENGTHS.message ||
    website.length > MAX_LENGTHS.website
  ) {
    return sendJson(response, 400, { ok: false, error: "Field is too long" });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return sendJson(response, 400, { ok: false, error: "Invalid email" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error("Telegram contact form is missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID.");
    return sendJson(response, 503, { ok: false, error: "Contact form is not configured" });
  }

  const text = [
    "📩 Нова заявка з портфоліо",
    "",
    `Ім’я: ${name}`,
    `Email: ${email}`,
    `Тип запиту: ${project}`,
    "",
    "Повідомлення:",
    message,
  ].join("\n");

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });
    const telegramResult = await telegramResponse.json().catch(() => null);

    if (!telegramResponse.ok || !telegramResult?.ok) {
      console.error("Telegram API rejected contact-form message.", telegramResponse.status);
      return sendJson(response, 502, { ok: false, error: "Telegram delivery failed" });
    }

    return sendJson(response, 200, { ok: true });
  } catch (error) {
    console.error("Telegram contact-form request failed.", error instanceof Error ? error.message : error);
    return sendJson(response, 502, { ok: false, error: "Telegram delivery failed" });
  }
};
