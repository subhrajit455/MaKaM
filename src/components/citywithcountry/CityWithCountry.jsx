import { useDispatch } from "react-redux";
import { clearCityData } from "../reducer/NationalismSlice";

const CityWithCountry = ({
  id,
  setCityname,
  cityData,
  setCityId,
  setCountryCode,
  onCitySelect,
}) => {
  const dispatch = useDispatch();

  const handleSelectTo = (city) => {
    if (!city?.cityId || !city?.cityName) return;

    setCityname(city.cityName);
    setCityId(city.cityId);
    setCountryCode(city.countryCode || "");
    if (onCitySelect) {
      onCitySelect(city);
    }
    dispatch(clearCityData());
    localStorage.setItem("cityname", JSON.stringify(city));
  };

  return (
    <div
      id={id}
      role="listbox"
      aria-label="Destination city suggestions"
      className="absolute left-0 top-full mt-2 w-full sm:w-[400px] max-w-[min(92vw,420px)] max-h-[340px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-[0_20px_50px_rgba(15,23,42,0.22)] overflow-y-auto overflow-x-hidden overscroll-contain scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 z-[9999]"
    >
      {Array.isArray(cityData?.data) &&
        cityData.data.map((city) => {
          const hasFlag = city.countryCode && city.countryCode !== "XX";

          return (
            <button
              key={city.cityId}
              type="button"
              role="option"
              aria-selected="false"
              onClick={() => handleSelectTo(city)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 hover:bg-emerald-50/60 dark:hover:bg-slate-800/80 transition-colors last:border-b-0 cursor-pointer text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#085c44]"
            >
              {/* Left */}
              <div className="flex items-center gap-3 min-w-0">
                {hasFlag ? (
                  <img
                    src={`https://flagcdn.com/w40/${city.countryCode.toLowerCase()}.png`}
                    alt=""
                    aria-hidden="true"
                    className="w-5 h-4 border border-slate-200 dark:border-slate-700 object-cover rounded-xs shrink-0"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="w-5 h-4 border border-slate-200 dark:border-slate-700 rounded-xs bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-500 shrink-0"
                  >
                    🌍
                  </div>
                )}

                <div className="min-w-0">
                  <p className="text-sm sm:text-[15px] font-bold uppercase tracking-wide text-slate-900 dark:text-white leading-snug truncate">
                    {city.cityName}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase truncate">
                    {city.country}
                  </p>
                </div>
              </div>

              {/* Right */}
              <span className="shrink-0 min-w-[38px] rounded-md bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/80 px-2 py-1 text-center text-[11px] font-bold text-[#085c44] dark:text-emerald-300">
                {city.countryCode}
              </span>
            </button>
          );
        })}
    </div>
  );
};

export default CityWithCountry;
