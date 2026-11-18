import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const rootDir = process.cwd();

test("1. GSAP & ScrollTrigger installation & config", async () => {
  const pkgJson = JSON.parse(readFileSync(resolve(rootDir, "package.json"), "utf-8"));
  assert.ok(pkgJson.dependencies.gsap, "gsap is in package.json dependencies");

  const viteConfig = readFileSync(resolve(rootDir, "vite.config.js"), "utf-8");
  assert.ok(viteConfig.includes("gsap"), "gsap is included in rollup vendor-motion chunk");
});

test("2. gsapScrollAnimations engine & hook existence", () => {
  assert.ok(existsSync(resolve(rootDir, "src/animations/gsapScrollAnimations.js")), "gsapScrollAnimations.js exists");
  assert.ok(existsSync(resolve(rootDir, "src/hooks/useScrollAnimation.js")), "useScrollAnimation.js exists");

  const engineCode = readFileSync(resolve(rootDir, "src/animations/gsapScrollAnimations.js"), "utf-8");
  assert.ok(engineCode.includes("gsap.registerPlugin(ScrollTrigger)"), "Registers ScrollTrigger plugin");
  assert.ok(engineCode.includes("prefersReducedMotion"), "Includes prefersReducedMotion check");
  assert.ok(engineCode.includes('clearProps: "transform,opacity"'), "Clears props for CSS hover harmony");
  assert.ok(engineCode.includes("stagger"), "Supports stagger animation");
  assert.ok(engineCode.includes("parallax"), "Supports parallax animation");
  assert.ok(engineCode.includes("clip-reveal"), "Supports clip-reveal animation");
  assert.ok(engineCode.includes("blur-reveal"), "Supports blur-reveal animation");
  assert.ok(engineCode.includes("zoom-in"), "Supports zoom-in animation");

  const hookCode = readFileSync(resolve(rootDir, "src/hooks/useScrollAnimation.js"), "utf-8");
  assert.ok(hookCode.includes("gsap.context"), "Wraps animations with gsap.context for React cleanup");
  assert.ok(hookCode.includes("revert"), "Calls ctx.revert() on unmount");
});

test("3. HeroSlider excludes target 'WELCOM TO MAQAM' / 'Start your journey with us' banner", () => {
  const heroSliderCode = readFileSync(resolve(rootDir, "src/components/shared/HeroSlider.jsx"), "utf-8");

  assert.ok(heroSliderCode.includes("WELCOM TO MAQAM"), "Filters out WELCOM TO MAQAM banner");
  assert.ok(heroSliderCode.includes("start your journey with us"), "Filters out Start your journey with us");
  assert.ok(heroSliderCode.includes('isTargetRemovedBanner'), "isTargetRemovedBanner guard exists");
  assert.ok(heroSliderCode.includes('data-animate="fade-down"'), "Hero eyebrow has GSAP fade-down entrance");
  assert.ok(heroSliderCode.includes('data-animate="fade-up"'), "Hero title & subtitle have GSAP fade-up entrance");
});

test("4. User-side components have data-animate attributes assigned", () => {
  const homeCode = readFileSync(resolve(rootDir, "src/pages/Home.jsx"), "utf-8");
  assert.ok(homeCode.includes("useScrollAnimation"), "Home.jsx imports and calls useScrollAnimation");
  assert.ok(homeCode.includes('data-animate="fade-up"'), "Home.jsx has fade-up sections");
  assert.ok(homeCode.includes('data-animate="stagger"'), "Home.jsx packages carousel has stagger animation");

  const searchCode = readFileSync(resolve(rootDir, "src/components/home-search/HomeSearchSection.jsx"), "utf-8");
  assert.ok(searchCode.includes('data-animate="zoom-in"'), "HomeSearchSection has zoom-in animation");

  const packagePageCode = readFileSync(resolve(rootDir, "src/pages/PackagePage.jsx"), "utf-8");
  assert.ok(!homeCode.includes("PilgrimLiveStrip"), "PilgrimLiveStrip removed from Home.jsx");
  assert.ok(!homeCode.includes("CostEstimatorWidget"), "CostEstimatorWidget removed from Home.jsx");
  assert.ok(!packagePageCode.includes("CostEstimatorWidget"), "CostEstimatorWidget removed from PackagePage.jsx");
  assert.ok(!existsSync(resolve(rootDir, "src/components/pilgrim/PilgrimLiveStrip.jsx")), "PilgrimLiveStrip.jsx deleted");
  assert.ok(!existsSync(resolve(rootDir, "src/components/calculator/CostEstimatorWidget.jsx")), "CostEstimatorWidget.jsx deleted");

  const destCode = readFileSync(resolve(rootDir, "src/components/destinations/DestinationsShowcase.jsx"), "utf-8");
  assert.ok(destCode.includes('data-animate="stagger"'), "DestinationsShowcase cards have stagger animation");

  const offersCode = readFileSync(resolve(rootDir, "src/components/offerssection/OffersSection.jsx"), "utf-8");
  assert.ok(offersCode.includes('data-animate="slide-left"'), "OffersSection banner has slide-left animation");

  const flightOffersCode = readFileSync(resolve(rootDir, "src/components/flightoffers/FlightOffersSection.jsx"), "utf-8");
  assert.ok(flightOffersCode.includes('data-animate="slide-right"'), "FlightOffersSection banner has slide-right animation");

  const howItWorksCode = readFileSync(resolve(rootDir, "src/components/howitworks/HowItWorksSection.jsx"), "utf-8");
  assert.ok(howItWorksCode.includes('data-animate="stagger"'), "HowItWorksSection step cards have stagger animation");

  const plannerCode = readFileSync(resolve(rootDir, "src/components/planner/TripPlannerShowcase.jsx"), "utf-8");
  assert.ok(plannerCode.includes('data-animate="clip-reveal"'), "TripPlannerShowcase has clip-reveal animation");

  const valuesCode = readFileSync(resolve(rootDir, "src/components/IslamicValuesSection.jsx"), "utf-8");
  assert.ok(valuesCode.includes('data-animate="stagger"'), "IslamicValuesSection has stagger cards animation");

  const reviewsCode = readFileSync(resolve(rootDir, "src/components/reviews/TravelerReviews.jsx"), "utf-8");
  assert.ok(reviewsCode.includes('data-animate="fade-up"'), "TravelerReviews has fade-up animation");

  const trustCode = readFileSync(resolve(rootDir, "src/components/trust/TrustAccreditationBar.jsx"), "utf-8");
  assert.ok(trustCode.includes('data-animate="stagger"'), "TrustAccreditationBar has stagger animation");

  const faqCode = readFileSync(resolve(rootDir, "src/components/faq/TravelFaqSection.jsx"), "utf-8");
  assert.ok(faqCode.includes('data-animate="stagger"'), "TravelFaqSection has stagger animation");

  const waCode = readFileSync(resolve(rootDir, "src/components/newsletter/WhatsAppClubBanner.jsx"), "utf-8");
  assert.ok(waCode.includes('data-animate="scale-up"'), "WhatsAppClubBanner has scale-up animation");

  const appCode = readFileSync(resolve(rootDir, "src/components/AppDownloadBanner.jsx"), "utf-8");
  assert.ok(appCode.includes('data-animate="fade-up"'), "AppDownloadBanner has fade-up animation");
});

test("5. Customer-facing cards preserve hover animations without hover-time shadows", () => {
  const indexCss = readFileSync(resolve(rootDir, "src/index.css"), "utf-8");
  const hoverRuleMatch = indexCss.match(/\.pro-card-interactive:hover\s*\{([\s\S]*?)\}/);
  assert.ok(hoverRuleMatch, ".pro-card-interactive:hover rule exists in src/index.css");
  assert.ok(hoverRuleMatch[1].includes("translateY(-3.5px)"), "Card hover lift animation preserved");
  assert.ok(!hoverRuleMatch[1].includes("box-shadow"), "Card hover box-shadow removed from .pro-card-interactive:hover");
  assert.ok(!indexCss.includes(".dark .pro-card-interactive:hover"), "Dark mode card hover box-shadow removed");

  const pureCardFiles = [
    "src/components/PackageCard.jsx",
    "src/components/RecommendedFlightCards.jsx",
    "src/components/howitworks/HowItWorksSection.jsx",
    "src/components/ziyarat/ZiyaratExplorerSection.jsx",
    "src/components/flight/FlightBoardingGuide.jsx",
    "src/components/insuranceplans/InsurancePlanSelection.jsx",
    "src/pages/HotelListing.jsx",
    "src/components/HotelRoomsListing.jsx",
    "src/components/HotelFacilities.jsx",
    "src/components/Room.jsx",
    "src/components/bookings/VisaBookingsTab.jsx",
    "src/components/user/CoTravellersManager.jsx",
  ];
  for (const relPath of pureCardFiles) {
    const code = readFileSync(resolve(rootDir, relPath), "utf-8");
    assert.ok(!/hover:shadow/.test(code), `${relPath} has no hover:shadow classes`);
  }

  // Files that have both cards and CTA buttons: assert the card elements themselves have no hover:shadow
  const mixedCardChecks = [
    ["src/components/DestinationCard.jsx", "hover:-translate-y-1.5 cursor-pointer flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm h-full"],
    ["src/components/DestinationCard.jsx", "duration-400 hover:-translate-y-1 bg-white"],
    ["src/components/guide/GuideCard.jsx", "guide-card-item group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-amber-400/50"],
    ["src/components/offerssection/ExclusiveOffers.jsx", "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700\""],
    ["src/components/visacountries/VisaCountries.jsx", "hover:-translate-y-1\n        active:scale-[0.98]"],
    ["src/components/insuranceplans/InsuranceSearchHero.jsx", "hover:-translate-y-0.5\""],
    ["src/components/Insurance.jsx", "bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm transition"],
    ["src/components/guides/GuidesDirectory.jsx", "bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition"],
    ["src/components/food.jsx", "food-menu-item-card flex-none"],
    ["src/components/cabbookingform/CabBookingForm.jsx", "bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs transition"],
    ["src/components/alplanner/AIPlanner.jsx", "shadow-2xs active:scale-[0.99]"],
    ["src/components/modal/ViewPricesModal.jsx", "border-slate-200 hover:border-slate-300 shadow-md\""],
    ["src/components/guide/GuideProfileModal.jsx", "hover:border-amber-400/80 bg-white dark:bg-slate-900\""],
  ];
  for (const [relPath, expectedSnippet] of mixedCardChecks) {
    const normalized = readFileSync(resolve(rootDir, relPath), "utf-8").replace(/\r\n/g, "\n");
    assert.ok(normalized.includes(expectedSnippet), `${relPath} card container omits hover:shadow`);
  }
});
