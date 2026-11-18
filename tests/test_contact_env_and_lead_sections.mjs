import { readFileSync } from "fs";
import { resolve } from "path";
import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeWhatsAppNumber,
  getSupportWhatsAppNumber,
  getSupportEmail,
  buildWhatsAppUrl,
  buildSupportMailtoUrl,
} from "../src/configs/contact.js";

const rootDir = process.cwd();

test("1. contact.js normalizes WhatsApp numbers and builds wa.me and mailto URLs from env", () => {
  assert.equal(normalizeWhatsAppNumber("9883250683"), "919883250683");
  assert.equal(normalizeWhatsAppNumber("+91 9883250683"), "919883250683");
  assert.equal(normalizeWhatsAppNumber("919883250683"), "919883250683");

  const customEnv = {
    VITE_WHATSAPP_NUMBER: "9883250683",
    VITE_SUPPORT_EMAIL: "maqamholiday@gmail.com",
  };
  assert.equal(getSupportWhatsAppNumber(customEnv), "919883250683");
  assert.equal(getSupportEmail(customEnv), "maqamholiday@gmail.com");

  const waUrl = buildWhatsAppUrl("Hello Maqam", customEnv);
  assert.equal(waUrl, "https://wa.me/919883250683?text=Hello%20Maqam");

  const mailtoUrl = buildSupportMailtoUrl(
    { subject: "Booking Help", body: "I need help with booking." },
    customEnv
  );
  assert.equal(
    mailtoUrl,
    "mailto:maqamholiday@gmail.com?subject=Booking%20Help&body=I%20need%20help%20with%20booking."
  );
});

test("2. .env and .env.example define VITE_WHATSAPP_NUMBER and VITE_SUPPORT_EMAIL", () => {
  const envContent = readFileSync(resolve(rootDir, ".env"), "utf-8");
  const envExampleContent = readFileSync(resolve(rootDir, ".env.example"), "utf-8");

  assert.match(envContent, /^VITE_WHATSAPP_NUMBER=9883250683$/m);
  assert.match(envContent, /^VITE_SUPPORT_EMAIL=maqamholiday@gmail\.com$/m);

  assert.match(envExampleContent, /^VITE_WHATSAPP_NUMBER=9883250683$/m);
  assert.match(envExampleContent, /^VITE_SUPPORT_EMAIL=maqamholiday@gmail\.com$/m);
});

test("3. AppDownloadBanner removes the mobile number input form while keeping app links and QR", () => {
  const appBannerCode = readFileSync(
    resolve(rootDir, "src/components/AppDownloadBanner.jsx"),
    "utf-8"
  );

  assert.ok(appBannerCode.includes('data-animate="fade-up"'));
  assert.ok(appBannerCode.includes("Download App Now!"));
  assert.ok(appBannerCode.includes("Google Play"));
  assert.ok(appBannerCode.includes("App Store"));
  assert.ok(!appBannerCode.includes("GET APP LINK"));
  assert.ok(!appBannerCode.includes("Enter mobile number"));
  assert.ok(!appBannerCode.includes("App link request received"));
  assert.ok(!appBannerCode.includes("<input"));
});

test("4. WhatsAppClubBanner opens WhatsApp using env config and logs lead when phone provided", () => {
  const waBannerCode = readFileSync(
    resolve(rootDir, "src/components/newsletter/WhatsAppClubBanner.jsx"),
    "utf-8"
  );

  assert.ok(waBannerCode.includes('data-animate="scale-up"'));
  assert.ok(waBannerCode.includes("buildWhatsAppUrl"));
  assert.ok(waBannerCode.includes("window.open(waUrl"));
  assert.ok(waBannerCode.includes("createLead("));
  assert.ok(!waBannerCode.includes("required\n"), "Phone input is optional for direct WhatsApp click");
});

test("5. Footer Stay Connected sends booking help to configured support email", () => {
  const footerCode = readFileSync(resolve(rootDir, "src/components/Footer.jsx"), "utf-8");

  assert.ok(footerCode.includes("Stay Connected"));
  assert.ok(footerCode.includes("buildSupportMailtoUrl"));
  assert.ok(footerCode.includes("getSupportEmail"));
  assert.ok(footerCode.includes("I need help with booking"));
  assert.ok(footerCode.includes("window.location.href = mailtoUrl"));
  assert.ok(footerCode.includes("createLead("));
});
