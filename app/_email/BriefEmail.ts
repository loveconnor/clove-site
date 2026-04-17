// Server-only module: builds the HTML + plain-text bodies for the
// brief-submission email. Styling is inlined because mail clients strip
// <style> blocks and CSS variables. Typography falls back to Helvetica /
// system stacks — LoveSans isn't available in email, but the hierarchy
// (light weight, italic accents, editorial rhythm) still matches the site.

export type BriefPayload = {
  projectType: string;
  budget: string;
  name: string;
  company: string;
  email: string;
  location: string;
  material: string;
  description: string;
  submittedAt: string; // ISO
};

const SANS =
  "Helvetica Neue, Helvetica, Arial, 'Segoe UI', Roboto, -apple-system, sans-serif";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });
};

type Row = { label: string; value: string; link?: boolean };

const fieldRow = ({ label, value, link }: Row) => {
  const safe = escapeHtml(value || "—");
  const rendered = link && value
    ? `<a href="${escapeHtml(value)}" style="color:#f2f2f0;text-decoration:underline;text-decoration-color:rgba(242,242,240,0.3);text-underline-offset:3px;">${safe}</a>`
    : safe;

  return `
    <tr>
      <td style="padding:18px 0;border-bottom:1px solid rgba(255,255,255,0.06);vertical-align:top;width:140px;">
        <div style="font:400 12px/1.4 ${SANS};letter-spacing:0.01em;color:#8a8a88;">
          ${escapeHtml(label)}
        </div>
      </td>
      <td style="padding:18px 0;border-bottom:1px solid rgba(255,255,255,0.06);vertical-align:top;">
        <div style="font:400 15px/1.5 ${SANS};letter-spacing:-0.005em;color:#f2f2f0;">
          ${rendered}
        </div>
      </td>
    </tr>
  `;
};

export function renderBriefEmailHtml(payload: BriefPayload) {
  const {
    projectType,
    budget,
    name,
    company,
    email,
    location,
    material,
    description,
    submittedAt,
  } = payload;

  const rows: Row[] = [
    { label: "Project type", value: projectType },
    { label: "Budget", value: budget },
    { label: "Name", value: name },
    { label: "Company", value: company || "—" },
    { label: "Email", value: email, link: true },
    { label: "Location", value: location || "—" },
    {
      label: "Material",
      value: material || "—",
      link: Boolean(material && /^https?:\/\//i.test(material)),
    },
  ];

  const description_html = escapeHtml(description || "—").replace(
    /\n/g,
    "<br />",
  );

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>New brief — clove</title>
    <style>
      @media (prefers-color-scheme: light) {
        /* Lock to dark so the aesthetic stays consistent across clients. */
      }
      a { color: #f2f2f0; }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#0a0a0a;color:#f2f2f0;font-family:${SANS};">
    <!-- Preview text (hidden) -->
    <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;color:transparent;opacity:0;">
      New brief from ${escapeHtml(name)} — ${escapeHtml(projectType)}, ${escapeHtml(budget)}
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
           style="background:#0a0a0a;padding:48px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0"
                 style="width:100%;max-width:560px;background:#111110;border:1px solid rgba(255,255,255,0.055);border-radius:14px;overflow:hidden;">

            <!-- Masthead -->
            <tr>
              <td style="padding:28px 32px 20px 32px;border-bottom:1px solid rgba(255,255,255,0.055);">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="vertical-align:middle;">
                      <div style="font:400 13px/1.3 ${SANS};letter-spacing:-0.005em;color:#f2f2f0;">
                        clove
                      </div>
                    </td>
                    <td style="vertical-align:middle;text-align:right;">
                      <div style="font:400 12px/1.3 ${SANS};color:#8a8a88;">
                        ${escapeHtml(formatDate(submittedAt))}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Headline -->
            <tr>
              <td style="padding:40px 32px 8px 32px;">
                <div style="font:400 12px/1.3 ${SANS};color:#8a8a88;margin-bottom:12px;">
                  Brief received
                </div>
                <h1 style="margin:0;font:300 32px/1.04 ${SANS};letter-spacing:-0.028em;color:#f2f2f0;max-width:22ch;">
                  A new brief
                  <span style="font-style:italic;font-weight:400;color:rgba(242,242,240,0.9);">from ${escapeHtml(name)}.</span>
                </h1>
              </td>
            </tr>

            <!-- Summary meta pill row -->
            <tr>
              <td style="padding:20px 32px 8px 32px;">
                <div>
                  <span style="display:inline-block;padding:6px 12px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);border-radius:999px;font:400 12px/1.3 ${SANS};color:#f2f2f0;margin:0 6px 6px 0;">
                    ${escapeHtml(projectType)}
                  </span>
                  <span style="display:inline-block;padding:6px 12px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);border-radius:999px;font:400 12px/1.3 ${SANS};color:#f2f2f0;margin:0 6px 6px 0;">
                    ${escapeHtml(budget)}
                  </span>
                </div>
              </td>
            </tr>

            <!-- Field rows -->
            <tr>
              <td style="padding:12px 32px 8px 32px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  ${rows.map(fieldRow).join("")}
                </table>
              </td>
            </tr>

            <!-- Project description -->
            <tr>
              <td style="padding:24px 32px 32px 32px;">
                <div style="font:400 12px/1.3 ${SANS};letter-spacing:0.01em;color:#8a8a88;margin-bottom:12px;">
                  Project description
                </div>
                <div style="padding:18px 20px;border-radius:10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);font:400 15px/1.6 ${SANS};letter-spacing:-0.005em;color:#f2f2f0;white-space:pre-wrap;">
                  ${description_html}
                </div>
              </td>
            </tr>

            <!-- CTA: reply -->
            <tr>
              <td style="padding:0 32px 36px 32px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="border-radius:999px;background:#f2f2f0;">
                      <a href="mailto:${escapeHtml(email)}?subject=${encodeURIComponent(`Re: ${projectType} — ${name}`)}"
                         style="display:inline-block;padding:13px 22px;font:400 13px/1 ${SANS};letter-spacing:-0.005em;color:#0a0a0a;text-decoration:none;border-radius:999px;">
                        Reply to ${escapeHtml(name)} &nbsp;&rarr;
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.045);background:rgba(0,0,0,0.25);">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="font:400 11.5px/1.4 ${SANS};color:#8a8a88;">
                      Submitted via clove.studio
                    </td>
                    <td style="text-align:right;font:400 11.5px/1.4 ${SANS};color:rgba(242,242,240,0.55);">
                      ${escapeHtml(formatDate(submittedAt))}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function renderBriefEmailText(payload: BriefPayload) {
  const { projectType, budget, name, company, email, location, material, description, submittedAt } = payload;

  return [
    "New brief received",
    "—".repeat(40),
    `Submitted: ${formatDate(submittedAt)}`,
    "",
    `Project type: ${projectType}`,
    `Budget:       ${budget}`,
    "",
    `Name:     ${name}`,
    `Company:  ${company || "—"}`,
    `Email:    ${email}`,
    `Location: ${location || "—"}`,
    `Material: ${material || "—"}`,
    "",
    "Project description",
    "—".repeat(40),
    description || "—",
    "",
    "—",
    "Submitted via clove.studio",
  ].join("\n");
}
