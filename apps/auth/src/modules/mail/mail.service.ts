import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as nodemailer from 'nodemailer';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend | null = null;
  private zohoTransport: nodemailer.Transporter | null = null;
  private readonly fromAddress: string;

  constructor(private readonly config: ConfigService) {
    const resendKey = this.config.get<string>('RESEND_API_KEY');
    if (resendKey) {
      this.resend = new Resend(resendKey);
    }

    const zohoUser = this.config.get<string>('ZOHO_SMTP_USER');
    const zohoPass = this.config.get<string>('ZOHO_SMTP_PASS');
    if (zohoUser && zohoPass) {
      this.zohoTransport = nodemailer.createTransport({
        host: this.config.get('ZOHO_SMTP_HOST', 'smtp.zoho.com'),
        port: this.config.get<number>('ZOHO_SMTP_PORT', 465),
        secure: true,
        auth: { user: zohoUser, pass: zohoPass },
      });
    }

    this.fromAddress = this.config.get('MAIL_FROM', 'noreply@codekang.dev');
  }

  private async send(payload: EmailPayload): Promise<void> {
    if (this.resend) {
      try {
        await this.resend.emails.send({
          from: this.fromAddress,
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
        });
        return;
      } catch (err) {
        this.logger.warn(`Resend failed, falling back to Zoho: ${err}`);
      }
    }

    if (this.zohoTransport) {
      try {
        await this.zohoTransport.sendMail({
          from: this.fromAddress,
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
        });
        return;
      } catch (err) {
        this.logger.error(`Zoho SMTP failed: ${err}`);
      }
    }

    this.logger.warn(
      `No mail provider configured — skipped: [${payload.subject}] to ${payload.to}`,
    );
  }

  // ─── Public event methods ──────────────────────────────────────────────────

  sendWelcomeEmail(user: { email: string; name: string }): Promise<void> {
    return this.send({
      to: user.email,
      subject: 'Welcome to CodeKang 🎉',
      html: this.welcomeHtml(user.name),
    });
  }

  sendLoginEmail(user: { email: string; name: string }): Promise<void> {
    return this.send({
      to: user.email,
      subject: 'New sign-in to your CodeKang account',
      html: this.loginHtml(user.name),
    });
  }

  sendLogoutEmail(user: { email: string; name: string }): Promise<void> {
    return this.send({
      to: user.email,
      subject: 'You have been signed out of CodeKang',
      html: this.logoutHtml(user.name),
    });
  }

  sendPurchaseEmail(
    user: { email: string; name: string },
    plan: string,
    price: string,
  ): Promise<void> {
    return this.send({
      to: user.email,
      subject: `Your CodeKang ${plan} plan is now active`,
      html: this.purchaseHtml(user.name, plan, price),
    });
  }

  sendInvoiceEmail(
    user: { email: string; name: string },
    plan: string,
    price: string,
    invoiceId: string,
    date: string,
  ): Promise<void> {
    return this.send({
      to: user.email,
      subject: `CodeKang Invoice — ${plan} plan`,
      html: this.invoiceHtml(user.name, plan, price, invoiceId, date),
    });
  }

  sendPaymentCompleteEmail(
    user: { email: string; name: string },
    plan: string,
    price: string,
  ): Promise<void> {
    return this.send({
      to: user.email,
      subject: 'Payment confirmed — CodeKang',
      html: this.paymentCompleteHtml(user.name, plan, price),
    });
  }

  sendPendingBillingEmail(
    user: { email: string; name: string },
    creditsRemaining: number,
    plan: string,
  ): Promise<void> {
    return this.send({
      to: user.email,
      subject: 'Action required: Low credits on your CodeKang account',
      html: this.pendingBillingHtml(user.name, creditsRemaining, plan),
    });
  }

  // ─── HTML templates ────────────────────────────────────────────────────────

  private baseHtml(title: string, body: string): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    body{margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
    .wrap{max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)}
    .hdr{background:#4f46e5;padding:32px 40px}
    .hdr h1{margin:0;color:#fff;font-size:22px;font-weight:700}
    .hdr p{margin:4px 0 0;color:#c7d2fe;font-size:13px}
    .bdy{padding:32px 40px;color:#374151;font-size:15px;line-height:1.7}
    .bdy h2{margin:0 0 12px;font-size:18px;color:#111827}
    .hl{background:#eef2ff;border-left:4px solid #4f46e5;padding:14px 18px;border-radius:4px;margin:20px 0}
    .hl strong{color:#4f46e5}
    .btn{display:inline-block;background:#4f46e5;color:#fff!important;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:600;font-size:14px;margin-top:20px}
    .ftr{background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;font-size:12px;color:#9ca3af;text-align:center}
    table{width:100%;border-collapse:collapse;margin:20px 0}
    th{text-align:left;font-size:12px;text-transform:uppercase;color:#6b7280;padding:8px 12px;border-bottom:2px solid #e5e7eb}
    td{padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:14px}
    tr:last-child td{border-bottom:none;font-weight:700}
  </style>
</head>
<body>
<div class="wrap">
  <div class="hdr"><h1>CodeKang</h1><p>AI-powered code review &amp; developer tools</p></div>
  <div class="bdy">${body}</div>
  <div class="ftr">&copy; ${new Date().getFullYear()} CodeKang. All rights reserved.</div>
</div>
</body>
</html>`;
  }

  private welcomeHtml(name: string): string {
    return this.baseHtml(
      'Welcome to CodeKang',
      `<h2>Welcome to CodeKang, ${name}! 👋</h2>
<p>Your account is ready. Here's what you can do right away:</p>
<ul>
  <li>Connect your GitHub repositories</li>
  <li>Get AI-powered PR reviews and inline comments</li>
  <li>Use the autonomous agent to fix issues automatically</li>
</ul>
<div class="hl"><strong>Free plan active</strong> — 50 credits/month, up to 5 private repos.</div>
<a class="btn" href="https://codekang.dev/dashboard">Go to Dashboard →</a>`,
    );
  }

  private loginHtml(name: string): string {
    return this.baseHtml(
      'New Sign-In — CodeKang',
      `<h2>New sign-in detected</h2>
<p>Hi ${name},</p>
<p>We noticed a new sign-in to your account at <strong>${new Date().toUTCString()}</strong>.</p>
<p>If this was you, no action is needed.</p>
<div class="hl">If you did not sign in, please <strong>secure your account immediately</strong>.</div>
<a class="btn" href="https://codekang.dev/settings">Manage Account →</a>`,
    );
  }

  private logoutHtml(name: string): string {
    return this.baseHtml(
      'Signed Out — CodeKang',
      `<h2>You've been signed out</h2>
<p>Hi ${name},</p>
<p>Your CodeKang session was ended at <strong>${new Date().toUTCString()}</strong>.</p>
<div class="hl">If you did not sign out, please <strong>secure your account immediately</strong>.</div>
<a class="btn" href="https://codekang.dev">Sign In Again →</a>`,
    );
  }

  private purchaseHtml(name: string, plan: string, price: string): string {
    return this.baseHtml(
      `${plan} Plan Activated — CodeKang`,
      `<h2>Plan activated — ${plan}</h2>
<p>Hi ${name},</p>
<p>Your <strong>${plan}</strong> plan has been activated successfully.</p>
<div class="hl"><strong>${plan}</strong> — ${price}/month<br/>Credits reset on the 1st of every month.</div>
<p>Start using your upgraded features right away.</p>
<a class="btn" href="https://codekang.dev/dashboard">Go to Dashboard →</a>`,
    );
  }

  private invoiceHtml(
    name: string,
    plan: string,
    price: string,
    invoiceId: string,
    date: string,
  ): string {
    return this.baseHtml(
      'Invoice — CodeKang',
      `<h2>Your invoice</h2>
<p>Hi ${name}, here's your CodeKang subscription invoice.</p>
<table>
  <thead><tr><th>Description</th><th>Date</th><th>Amount</th></tr></thead>
  <tbody>
    <tr><td>CodeKang ${plan} plan</td><td>${date}</td><td>${price}/mo</td></tr>
    <tr><td colspan="2">Total</td><td>${price}</td></tr>
  </tbody>
</table>
<p style="font-size:12px;color:#6b7280">Invoice ID: ${invoiceId}</p>
<a class="btn" href="https://codekang.dev/settings/billing">View Billing →</a>`,
    );
  }

  private paymentCompleteHtml(name: string, plan: string, price: string): string {
    return this.baseHtml(
      'Payment Confirmed — CodeKang',
      `<h2>Payment confirmed ✓</h2>
<p>Hi ${name},</p>
<p>We've received your payment for the <strong>${plan}</strong> plan.</p>
<div class="hl">
  <strong>Amount:</strong> ${price}<br/>
  <strong>Plan:</strong> ${plan}<br/>
  <strong>Date:</strong> ${new Date().toDateString()}
</div>
<p>Your subscription is active and credits have been reset.</p>
<a class="btn" href="https://codekang.dev/settings/billing">View Billing →</a>`,
    );
  }

  private pendingBillingHtml(
    name: string,
    creditsRemaining: number,
    plan: string,
  ): string {
    return this.baseHtml(
      'Low Credits — CodeKang',
      `<h2>You're running low on credits</h2>
<p>Hi ${name},</p>
<p>Your <strong>${plan}</strong> plan has only <strong>${creditsRemaining} credits</strong> remaining this month.</p>
<div class="hl">Credits reset on the 1st of each month. Upgrade to avoid service interruption.</div>
<a class="btn" href="https://codekang.dev/settings/billing">Upgrade Plan →</a>`,
    );
  }
}
