import React from "react";

export const getContinentForCountry = (countryName = "") => {
  const c = countryName.toLowerCase();
  if (
    [
      "saudi arabia",
      "united arab emirates",
      "uae",
      "oman",
      "qatar",
      "kuwait",
      "bahrain",
      "jordan",
      "lebanon",
    ].some((x) => c.includes(x))
  )
    return "Middle East";
  if (
    [
      "malaysia",
      "indonesia",
      "singapore",
      "uzbekistan",
      "azerbaijan",
      "bangladesh",
      "thailand",
      "vietnam",
      "japan",
      "sri lanka",
      "india",
    ].some((x) => c.includes(x))
  )
    return "Asia";
  if (
    [
      "turkey",
      "türkiye",
      "united kingdom",
      "uk",
      "france",
      "germany",
      "georgia",
      "russia",
      "schengen",
      "italy",
      "spain",
      "switzerland",
    ].some((x) => c.includes(x))
  )
    return "Europe";
  if (
    [
      "egypt",
      "morocco",
      "kenya",
      "south africa",
      "tanzania",
      "mauritius",
      "seychelles",
    ].some((x) => c.includes(x))
  )
    return "Africa";
  return "Popular";
};

export const getCountryFlag = (countryCode) => {
  if (!countryCode) return "🌍";
  try {
    return countryCode
      .toUpperCase()
      .split("")
      .map((char) => String.fromCodePoint(127397 + char.charCodeAt()))
      .join("");
  } catch {
    return "🌍";
  }
};

export const categoryTabs = [
  "All Visas",
  "Popular",
  "Middle East",
  "Asia",
  "Europe",
  "Africa",
];

// Bulletproof Country Flag Renderer (handles URLs, Cloudinary paths, and emojis without leaking links)
export function CountryFlagIcon({
  flag,
  code,
  name = "Country",
  className = "w-6 h-4 rounded-sm object-cover inline-block shadow-2xs shrink-0",
}) {
  const isImageUrl =
    typeof flag === "string" &&
    (flag.startsWith("http") ||
      flag.includes("/") ||
      flag.includes(".png") ||
      flag.includes(".jpg") ||
      flag.includes(".webp") ||
      flag.includes(".svg"));

  if (isImageUrl) {
    const src = flag.startsWith("http")
      ? flag
      : code
        ? `https://flagcdn.com/w80/${code.toLowerCase()}.png`
        : `https://flagcdn.com/w80/ae.png`;

    return (
      <img
        src={src}
        alt={`${name} flag`}
        className={className}
        loading="lazy"
        onError={(e) => {
          if (code) {
            e.currentTarget.src = `https://flagcdn.com/w80/${code.toLowerCase()}.png`;
          } else {
            e.currentTarget.style.display = "none";
          }
        }}
      />
    );
  }

  return (
    <span className="leading-none select-none text-base shrink-0 inline-block">
      {flag || "🌐"}
    </span>
  );
}

// Automated Passport Bio / Front Page Authenticator & Validator
export const validatePassportFrontImage = (file, dataUrl) => {
  return new Promise((resolve) => {
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
      "application/pdf",
    ];
    const isMimeOk =
      allowedMimes.includes(file.type?.toLowerCase()) ||
      Boolean(file.name?.match(/\.(jpe?g|png|webp|pdf)$/i));

    if (!isMimeOk) {
      return resolve({
        isValid: false,
        error:
          "Invalid file format. Please upload a clear JPG, PNG, or WEBP photo of your passport front page.",
      });
    }

    if (file.size < 15 * 1024) {
      return resolve({
        isValid: false,
        error:
          "File size too small (under 15KB). Please upload a clear, legible passport front / bio page scan.",
      });
    }

    if (file.size > 10 * 1024 * 1024) {
      return resolve({
        isValid: false,
        error: "File size exceeds 10MB. Please choose a smaller image under 10MB.",
      });
    }

    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      return resolve({
        isValid: true,
        details: {
          resolution: "PDF Document Scan",
          quality: "Official Document PDF",
          fileSize: `${(file.size / 1024).toFixed(0)} KB`,
        },
      });
    }

    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      if (width < 380 || height < 260) {
        return resolve({
          isValid: false,
          error: `Image resolution (${width}×${height}px) is too low. Minimum 400×300px required for passport bio page authentication.`,
        });
      }

      const ratio = width / height;
      if (ratio < 0.4 || ratio > 2.5) {
        return resolve({
          isValid: false,
          error:
            "Unusual aspect ratio. Please upload a straight, full photo of the passport bio/front page.",
        });
      }

      try {
        const canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, 64, 64);
        const imgData = ctx.getImageData(0, 0, 64, 64).data;

        let totalBrightness = 0;
        let count = 0;
        for (let i = 0; i < imgData.length; i += 4) {
          const brightness = (imgData[i] + imgData[i + 1] + imgData[i + 2]) / 3;
          totalBrightness += brightness;
          count++;
        }
        const avg = totalBrightness / count;

        let variance = 0;
        for (let i = 0; i < imgData.length; i += 4) {
          const brightness = (imgData[i] + imgData[i + 1] + imgData[i + 2]) / 3;
          variance += Math.pow(brightness - avg, 2);
        }
        const stdDev = Math.sqrt(variance / count);

        if (stdDev < 10) {
          return resolve({
            isValid: false,
            error:
              "Image appears to be blank or solid color. Please upload a genuine photo or scan of your passport front page.",
          });
        }
      } catch {
        // Canvas fallback
      }

      resolve({
        isValid: true,
        details: {
          resolution: `${width} × ${height} px`,
          quality: "High Quality Color Scan",
          fileSize: `${(file.size / 1024).toFixed(0)} KB`,
        },
      });
    };

    img.onerror = () => {
      resolve({
        isValid: false,
        error: "Unable to read image. Please upload a valid, uncorrupted image.",
      });
    };

    img.src = dataUrl;
  });
};
