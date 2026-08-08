import { Resend } from "resend";

const SITE_URL = "https://sherrihaskell.com";
const LOGO_URL = `${SITE_URL}/assets/logo-header.png`;
const DEFAULT_FROM = "Sherri Haskell <hello@sherrihaskell.com>";
const DEFAULT_TO = "Sherri@c2csmarthealth.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
  };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function brandShell({ preheader, title, bodyHtml, footerNote }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#F7F5F0;color:#1B2A4A;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F5F0;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:4px;overflow:hidden;border:1px solid #e6e1d8;">
          <tr>
            <td style="background:#1B2A4A;padding:22px 28px;border-bottom:3px solid #C9A84C;">
              <img src="${LOGO_URL}" alt="Sherri Haskell, Medicare Strategy Specialist" width="220" style="display:block;width:220px;max-width:70%;height:auto;border:0;" />
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px 12px 28px;font-family:Georgia,'Times New Roman',serif;">
              <p style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#C9A84C;font-weight:700;">Sherri Haskell</p>
              <h1 style="margin:0 0 18px 0;font-size:26px;line-height:1.3;color:#1B2A4A;font-weight:400;">${escapeHtml(title)}</h1>
              <div style="width:48px;height:2px;background:#C9A84C;margin:0 0 22px 0;"></div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#3a4a5c;">
                ${bodyHtml}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px 28px;font-family:Arial,Helvetica,sans-serif;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#111d33;border-radius:3px;">
                <tr>
                  <td style="padding:20px 22px;color:#ffffff;">
                    <p style="margin:0 0 6px 0;font-size:14px;font-weight:700;">Sherri Haskell</p>
                    <p style="margin:0 0 6px 0;font-size:13px;color:#d7deea;">Medicare Strategic Specialist</p>
                    <p style="margin:0 0 10px 0;font-size:12px;color:#C9A84C;">Coast to Coast Health Insurance Solutions, LLC · CA License #4496898</p>
                    <p style="margin:0;font-size:13px;line-height:1.6;">
                      <a href="tel:+14154047576" style="color:#ffffff;text-decoration:none;">(415) 404-7576</a><br/>
                      <a href="mailto:Sherri@c2csmarthealth.com" style="color:#ffffff;text-decoration:none;">Sherri@c2csmarthealth.com</a><br/>
                      <a href="${SITE_URL}/" style="color:#C9A84C;text-decoration:none;">SherriHaskell.com</a>
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0 0;font-size:11px;line-height:1.5;color:#6b7a8d;text-align:center;">
                ${footerNote}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function row(label, value) {
  if (!value) return "";
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid #ece7de;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7a8d;width:38%;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:10px 0;border-bottom:1px solid #ece7de;font-size:15px;color:#1B2A4A;vertical-align:top;">${escapeHtml(value)}</td>
  </tr>`;
}

function buildAdminEmail(data) {
  const bodyHtml = `
    <p style="margin:0 0 18px 0;">A new confidential conversation request was submitted on SherriHaskell.com.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px 0;">
      ${row("Name", data.name)}
      ${row("Email", data.email)}
      ${row("Phone", data.phone)}
      ${row("Preferred contact", data.preferred)}
      ${row("Message", data.message || "(No message provided)")}
    </table>
    <p style="margin:0;font-size:13px;color:#6b7a8d;">Reply directly to this email to respond to the visitor.</p>
  `;

  return brandShell({
    preheader: `New inquiry from ${data.name}`,
    title: "New conversation request",
    bodyHtml,
    footerNote:
      "Internal notification from SherriHaskell.com. Your information handling remains confidential.",
  });
}

function buildConfirmationEmail(data) {
  const bodyHtml = `
    <p style="margin:0 0 14px 0;">Dear ${escapeHtml(data.name)},</p>
    <p style="margin:0 0 14px 0;">Thank you for reaching out. I received your request for a confidential conversation and will follow up shortly${
      data.preferred && data.preferred !== "Either"
        ? ` by <strong>${escapeHtml(data.preferred.toLowerCase())}</strong>`
        : ""
    }.</p>
    <p style="margin:0 0 18px 0;">Healthcare decisions have financial consequences — I look forward to helping you approach yours with clarity and strategy.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F5F0;border-radius:3px;margin:0 0 18px 0;">
      <tr>
        <td style="padding:16px 18px;">
          <p style="margin:0 0 8px 0;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#C9A84C;font-weight:700;">Your submission</p>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#3a4a5c;">
            <strong>Preferred contact:</strong> ${escapeHtml(data.preferred)}<br/>
            <strong>Phone:</strong> ${escapeHtml(data.phone || "—")}<br/>
            <strong>Message:</strong> ${escapeHtml(data.message || "—")}
          </p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 18px 0;">If you need to reach me sooner, call <a href="tel:+14154047576" style="color:#2E86AB;text-decoration:none;">(415) 404-7576</a> or email <a href="mailto:Sherri@c2csmarthealth.com" style="color:#2E86AB;text-decoration:none;">Sherri@c2csmarthealth.com</a>.</p>
    <p style="margin:0;">Warmly,<br/><strong>Sherri Haskell</strong><br/><span style="color:#6b7a8d;">Medicare Strategic Specialist</span></p>
  `;

  return brandShell({
    preheader: "Thank you — your confidential conversation request was received.",
    title: "We received your request",
    bodyHtml,
    footerNote:
      'Coast to Coast Health Insurance Solutions, LLC is not a government agency. CA License #4496898. <a href="' +
      SITE_URL +
      '/privacy-policy.html" style="color:#6b7a8d;">Privacy Policy</a>',
  });
}

function parseBody(event) {
  if (!event.body) return {};
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;
  try {
    return JSON.parse(raw);
  } catch {
    const params = new URLSearchParams(raw);
    return Object.fromEntries(params.entries());
  }
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Method not allowed" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Missing RESEND_API_KEY");
    return json(500, { ok: false, error: "Email service is not configured." });
  }

  const payload = parseBody(event);
  const name = String(payload.name || "").trim();
  const email = String(payload.email || "").trim();
  const phone = String(payload.phone || "").trim();
  const preferred = String(payload.preferred || "Either").trim();
  const message = String(payload.message || "").trim();
  const honeypot = String(payload.company || payload.website || "").trim();

  // Silent success for bots
  if (honeypot) {
    return json(200, { ok: true });
  }

  if (!name || name.length > 120) {
    return json(400, { ok: false, error: "Please enter your name." });
  }
  if (!email || !isValidEmail(email) || email.length > 200) {
    return json(400, { ok: false, error: "Please enter a valid email address." });
  }
  if (!phone || phone.length > 40) {
    return json(400, { ok: false, error: "Please enter your phone number." });
  }
  if (message.length > 4000) {
    return json(400, { ok: false, error: "Message is too long." });
  }

  const data = { name, email, phone, preferred, message };
  const from = process.env.CONTACT_FROM || DEFAULT_FROM;
  const to = process.env.CONTACT_TO || DEFAULT_TO;
  const resend = new Resend(apiKey);

  try {
    const adminResult = await resend.emails.send({
      from,
      to: [to],
      replyTo: email,
      subject: `New conversation request — ${name}`,
      html: buildAdminEmail(data),
      text: [
        "New conversation request from SherriHaskell.com",
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Preferred contact: ${preferred}`,
        `Message: ${message || "(none)"}`,
      ].join("\n"),
    });

    if (adminResult.error) {
      console.error("Admin email error:", adminResult.error);
      return json(502, {
        ok: false,
        error: "Unable to send your request right now. Please try again or call (415) 404-7576.",
      });
    }

    const confirmResult = await resend.emails.send({
      from,
      to: [email],
      replyTo: to,
      subject: "We received your confidential conversation request",
      html: buildConfirmationEmail(data),
      text: [
        `Dear ${name},`,
        "",
        "Thank you for reaching out. I received your request for a confidential conversation and will follow up shortly.",
        "",
        `Preferred contact: ${preferred}`,
        `Phone: ${phone}`,
        `Message: ${message || "—"}`,
        "",
        "Warmly,",
        "Sherri Haskell",
        "Medicare Strategic Specialist",
        "(415) 404-7576",
        "Sherri@c2csmarthealth.com",
      ].join("\n"),
    });

    if (confirmResult.error) {
      console.error("Confirmation email error:", confirmResult.error);
      // Admin already notified — treat as success for the visitor
    }

    return json(200, { ok: true });
  } catch (err) {
    console.error("Contact function failed:", err);
    return json(500, {
      ok: false,
      error: "Unable to send your request right now. Please try again or call (415) 404-7576.",
    });
  }
}
