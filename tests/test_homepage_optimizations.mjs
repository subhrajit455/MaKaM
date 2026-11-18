import { readFileSync, existsSync, statSync } from "fs";
import { resolve } from "path";
import test from "node:test";
import assert from "node:assert/strict";

const rootDir = process.cwd();

test("1. index.html SEO, Metadata & Async Fonts Verification", () => {
  const indexHtml = readFileSync(resolve(rootDir, "index.html"), "utf-8");

  // Meta description & Title
  assert.ok(indexHtml.includes("<title>GoMaqam | Verified Umrah &amp; Hajj Packages"), "Title has professional travel copy");
  assert.ok(indexHtml.includes('<meta name="description" content="Book verified Umrah &amp; Hajj packages'), "Meta description present");
  assert.ok(indexHtml.includes('<link rel="canonical" href="https://gomaqam.com/" />'), "Canonical URL present");

  // OpenGraph & Twitter
  assert.ok(indexHtml.includes('<meta property="og:title"'), "OpenGraph title present");
  assert.ok(indexHtml.includes('<meta name="twitter:card" content="summary_large_image" />'), "Twitter card present");

  // Schema.org JSON-LD
  const jsonLdMatch = indexHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(jsonLdMatch, "JSON-LD script tag present");
  const schema = JSON.parse(jsonLdMatch[1]);
  assert.equal(schema["@context"], "https://schema.org");
  assert.ok(Array.isArray(schema["@graph"]), "Schema graph array present");
  const travelAgency = schema["@graph"].find((item) => item["@type"] === "TravelAgency");
  assert.ok(travelAgency, "TravelAgency schema entry present");
  assert.equal(travelAgency.name, "GoMaqam Travels");

  // Non-blocking Google Fonts
  assert.ok(indexHtml.includes('media="print"'), "Async print media style loader present");
  assert.ok(indexHtml.includes('onload="this.media=\'all\'"'), "Onload all media switch present");
  assert.ok(!indexHtml.includes('rel="preload"\n      as="style"\n      href="https://fonts.googleapis.com'), "Redundant font style preload removed");
});

test("2. src/index.css has no blocking @import font rules", () => {
  const css = readFileSync(resolve(rootDir, "src/index.css"), "utf-8");
  assert.ok(!css.includes('@import url("https://fonts.googleapis.com'), "Render blocking Google Fonts @import removed from index.css");
});

test("3. src/pages/Home.jsx SEO Heading, Copywriting & Dead Code Elimination", () => {
  const homeCode = readFileSync(resolve(rootDir, "src/pages/Home.jsx"), "utf-8");
  const plannerCode = readFileSync(resolve(rootDir, "src/components/planner/TripPlannerShowcase.jsx"), "utf-8");

  // Semantic <h1> heading in top HeroSlider & <h2> in TripPlannerShowcase
  assert.ok(homeCode.includes("<HeroSlider"), "Top HeroSlider present");
  assert.ok(homeCode.includes("<TripPlannerShowcase"), "TripPlannerShowcase rendered in Home.jsx");
  assert.ok(!homeCode.includes("<Bot"), "Generic Bot icon eliminated from Home.jsx");
  assert.ok(!plannerCode.includes("<Bot"), "Generic Bot icon eliminated from TripPlannerShowcase.jsx");
  assert.ok(plannerCode.includes("Plan Your Pilgrimage &amp; Journey with our"), "Trip planner heading copy intact");

  // Authoritative Pilgrimage Copywriting
  assert.ok(homeCode.includes("About GoMaqam — Your Trusted Pilgrimage &amp; Halal Travel Partner"), "About section title updated");
  assert.ok(homeCode.includes("Verified Haram Stays"), "Badge: Verified Haram Stays present");
  assert.ok(homeCode.includes("Certified Halal Dining"), "Badge: Certified Halal Dining present");
  assert.ok(homeCode.includes("Prime Courtyard Access"), "Badge: Prime Courtyard Access present");
  assert.ok(homeCode.includes("Licensed Ground Transfers"), "Badge: Licensed Ground Transfers present");

  // Dead Code & Duplicate Searchbox Elimination
  assert.ok(!homeCode.includes("showSearchSheet"), "Dead showSearchSheet state removed");
  assert.ok(!homeCode.includes("showSearchOverlay"), "Dead showSearchOverlay state removed");
  assert.ok(!homeCode.includes('import CommonFlightHotelSearchBox from "../components/commonflighthotelsearchbox/CommonFlightHotelSearchBox"'), "Duplicate CommonFlightHotelSearchBox import removed from Home");
  assert.ok(!homeCode.includes('import HotelSearch from "./HotelSearch"'), "Duplicate HotelSearch import removed from Home");

  // Code Splitting
  assert.ok(homeCode.includes('const CustomPackageBuilder = lazy(() => import("../components/CustomPackageBuilder"))'), "CustomPackageBuilder is code-split with lazy");
  assert.ok(homeCode.includes("packageService.getPackages({ limit: 8 })"), "package query limited to 8 items");
});

test("4. src/components/IslamicValuesSection.jsx Video Concurrency & Visibility Guard", () => {
  const videoCode = readFileSync(resolve(rootDir, "src/components/IslamicValuesSection.jsx"), "utf-8");

  assert.ok(videoCode.includes('preload="none"'), "Video preload set to none");
  assert.ok(videoCode.includes("isVisible ? islamicVideo : undefined"), "Video src lazy-loaded on isVisible");
  assert.ok(videoCode.includes("offsetParent !== null"), "Checks offsetParent before play() to avoid concurrent multi-stream playback");
  assert.ok(videoCode.includes('addEventListener("resize", syncPlayback)'), "Handles responsive layout resizing");
});

test("5. src/components/shared/HeroSlider.jsx Slide Prioritization & State Resilience", () => {
  const sliderCode = readFileSync(resolve(rootDir, "src/components/shared/HeroSlider.jsx"), "utf-8");

  assert.ok(sliderCode.includes('fetchPriority={index === 0 ? "high" : "low"}'), "Slide 0 has high fetchPriority");
  assert.ok(sliderCode.includes('loading={index === 0 ? "eager" : "lazy"}'), "Slide 0 is eager, subsequent lazy");
  assert.ok(sliderCode.includes("!visitedSlides.has(index) && index !== currentSlide"), "currentSlide always rendered safely");
});

test("6. src/components/commonflighthotelsearchbox/CommonFlightHotelSearchBox.jsx Performance & Resilience", () => {
  const searchBoxCode = readFileSync(resolve(rootDir, "src/components/commonflighthotelsearchbox/CommonFlightHotelSearchBox.jsx"), "utf-8");

  // Pure useMemo derivation prevents stale dropdowns
  assert.ok(searchBoxCode.includes("const fromSuggestions = useMemo("), "fromSuggestions derived via useMemo");
  assert.ok(searchBoxCode.includes("const toSuggestions = useMemo("), "toSuggestions derived via useMemo");

  // Safe sessionStorage guards
  assert.ok(searchBoxCode.includes("sessionStorage.setItem("), "sessionStorage caching intact");
  assert.ok(searchBoxCode.includes("try {\n      cached = sessionStorage.getItem("), "sessionStorage.getItem safely wrapped in try/catch");

  // Derived disabled state (no cascading render effect)
  assert.ok(searchBoxCode.includes("const isDisabled = !(selectedFrom && selectedTo);"), "isDisabled derived without setState in effect");
});

test("7. Media Asset Sizes & Resampling Verification", () => {
  // Reviewer avatars
  const avatarFiles = ["altaf.jpg", "ayesha.jpg", "farhan.jpg", "noorjahan.jpg", "shakeel.jpg", "tariq.jpg", "zeenat.jpg", "zubair.jpg"];
  for (const file of avatarFiles) {
    const p = resolve(rootDir, "src/assets/reviews", file);
    assert.ok(existsSync(p), `Avatar file ${file} exists`);
    const size = statSync(p).size;
    assert.ok(size < 15000, `Avatar file ${file} size (${size} bytes) is optimized below 15 KB`);
  }

  // Hero slider images
  const slideFiles = [
    "slide1-makkah-kaaba-tawaf.jpg",
    "slide2-madinah-prophet-mosque.jpg",
    "slide3-madinah-green-dome.jpg",
    "slide4-haramain-highspeed-rail.jpg",
    "slide5-quba-mosque-madinah.jpg"
  ];
  let totalSlideSize = 0;
  for (const file of slideFiles) {
    const p = resolve(rootDir, "src/assets/hero-slider", file);
    assert.ok(existsSync(p), `Hero slide ${file} exists`);
    const size = statSync(p).size;
    totalSlideSize += size;
  }
  // Total size must be under 2 MB (previously 7.43 MB)
  assert.ok(totalSlideSize < 2000000, `Total hero slide size (${totalSlideSize} bytes) is optimized below 2 MB`);
});
