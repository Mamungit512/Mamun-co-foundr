"use client";

import { useEffect, useRef, useState } from "react";
import {
  Country,
  State,
  City,
  ICountry,
  IState,
  ICity,
} from "country-state-city";

type LocationSelectorProps = {
  countryValue: string;
  stateValue: string;
  cityValue?: string;
  onCountryChange: (country: string) => void;
  onStateChange: (state: string) => void;
  onCityChange?: (city: string) => void;
  errors?: {
    country?: string;
    state?: string;
    city?: string;
  };
};

const MAX_SUGGESTIONS = 100;

export default function LocationSelector({
  countryValue,
  stateValue,
  cityValue,
  onCountryChange,
  onStateChange,
  onCityChange,
  errors,
}: LocationSelectorProps) {
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [selectedCountryIso, setSelectedCountryIso] = useState("");
  const [selectedStateIso, setSelectedStateIso] = useState("");
  const [isUS, setIsUS] = useState(false);

  // Combobox state
  const [cityInput, setCityInput] = useState(cityValue || "");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const comboboxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  // Sync external cityValue into local input display
  useEffect(() => {
    setCityInput(cityValue || "");
  }, [cityValue]);

  useEffect(() => {
    if (countryValue && countries.length > 0) {
      const country = countries.find((c) => c.name === countryValue);
      if (country) setSelectedCountryIso(country.isoCode);
    }
  }, [countryValue, countries]);

  useEffect(() => {
    if (stateValue && states.length > 0) {
      const state = states.find((s) => s.name === stateValue);
      if (state) setSelectedStateIso(state.isoCode);
    }
  }, [stateValue, states]);

  useEffect(() => {
    if (!selectedCountryIso) {
      setStates([]);
      setIsUS(false);
      return;
    }
    const countryIsUS = selectedCountryIso === "US";
    setIsUS(countryIsUS);
    setStates(
      countryIsUS ? State.getStatesOfCountry(selectedCountryIso) || [] : [],
    );
  }, [selectedCountryIso]);

  useEffect(() => {
    if (!selectedCountryIso) {
      setCities([]);
      return;
    }
    const data = selectedStateIso
      ? City.getCitiesOfState(selectedCountryIso, selectedStateIso) || []
      : City.getCitiesOfCountry(selectedCountryIso) || [];
    setCities(data);
  }, [selectedCountryIso, selectedStateIso]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        comboboxRef.current &&
        !comboboxRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredCities = cityInput.trim()
    ? cities
        .filter((c) =>
          c.name.toLowerCase().startsWith(cityInput.trim().toLowerCase()),
        )
        .concat(
          cities.filter(
            (c) =>
              !c.name.toLowerCase().startsWith(cityInput.trim().toLowerCase()) &&
              c.name.toLowerCase().includes(cityInput.trim().toLowerCase()),
          ),
        )
        .slice(0, MAX_SUGGESTIONS)
    : cities.slice(0, MAX_SUGGESTIONS);

  const handleCityInputChange = (value: string) => {
    setCityInput(value);
    setIsOpen(true);
    setActiveIndex(-1);
    // Clear the confirmed value while the user is typing
    onCityChange?.("");
  };

  const handleCitySelect = (name: string) => {
    setCityInput(name);
    onCityChange?.(name);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleCityBlur = () => {
    // If the typed text doesn't match the confirmed value, revert to last confirmed
    setTimeout(() => {
      if (!comboboxRef.current?.contains(document.activeElement)) {
        setCityInput(cityValue || "");
        setIsOpen(false);
      }
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") setIsOpen(true);
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filteredCities.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && filteredCities[activeIndex]) {
          handleCitySelect(filteredCities[activeIndex].name);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setCityInput(cityValue || "");
        break;
      case "Tab":
        setIsOpen(false);
        setCityInput(cityValue || "");
        break;
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const isDisabled = !selectedCountryIso || (isUS && !selectedStateIso);

  const selectClass =
    "w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-2.5 text-white " +
    "focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-2.5 text-white " +
    "focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none " +
    "placeholder-white/30 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="space-y-4">
      {/* Country */}
      <div className="flex flex-col gap-y-2">
        <label className="text-sm font-medium text-gray-300">Country *</label>
        <select
          className={selectClass}
          value={selectedCountryIso}
          onChange={(e) => {
            const iso = e.target.value;
            setSelectedCountryIso(iso);
            setSelectedStateIso("");
            const country = countries.find((c) => c.isoCode === iso);
            onCountryChange(country?.name || "");
            onStateChange("");
            onCityChange?.("");
            setCityInput("");
          }}
        >
          <option value="">Select a country</option>
          {countries.map((c) => (
            <option key={c.isoCode} value={c.isoCode}>
              {c.name}
            </option>
          ))}
        </select>
        {errors?.country && (
          <p className="text-xs text-red-500">{errors.country}</p>
        )}
      </div>

      {/* State — US only */}
      {isUS && (
        <div className="flex flex-col gap-y-2">
          <label className="text-sm font-medium text-gray-300">State *</label>
          <select
            className={selectClass}
            value={selectedStateIso}
            disabled={states.length === 0}
            onChange={(e) => {
              const iso = e.target.value;
              setSelectedStateIso(iso);
              const state = states.find((s) => s.isoCode === iso);
              onStateChange(state?.name || "");
              onCityChange?.("");
              setCityInput("");
            }}
          >
            <option value="">
              {states.length === 0 ? "No states available" : "Select a state"}
            </option>
            {states.map((state) => (
              <option key={state.isoCode} value={state.isoCode}>
                {state.name}
              </option>
            ))}
          </select>
          {errors?.state && (
            <p className="text-xs text-red-500">{errors.state}</p>
          )}
        </div>
      )}

      {/* City — constrained combobox */}
      <div className="flex flex-col gap-y-2">
        <label className="text-sm font-medium text-gray-300">City *</label>
        <div ref={comboboxRef} className="relative">
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-activedescendant={
              activeIndex >= 0 ? `city-option-${activeIndex}` : undefined
            }
            className={inputClass}
            value={cityInput}
            disabled={isDisabled}
            placeholder={
              !selectedCountryIso
                ? "First select a country"
                : isUS && !selectedStateIso
                  ? "First select a state"
                  : cities.length === 0
                    ? "No cities available"
                    : "Search for a city…"
            }
            onChange={(e) => handleCityInputChange(e.target.value)}
            onFocus={() => {
              if (!isDisabled) setIsOpen(true);
            }}
            onBlur={handleCityBlur}
            onKeyDown={handleKeyDown}
          />

          {isOpen && filteredCities.length > 0 && (
            <ul
              ref={listRef}
              role="listbox"
              className={
                "absolute z-50 mt-1 max-h-60 w-full overflow-y-auto " +
                "rounded-lg border border-white/10 bg-[#1a1a1a] py-1 shadow-xl"
              }
            >
              {filteredCities.map((city, index) => (
                <li
                  key={`${city.name}-${city.stateCode}-${index}`}
                  id={`city-option-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={
                    "cursor-pointer px-4 py-2 text-sm text-white " +
                    (index === activeIndex
                      ? "bg-blue-600"
                      : "hover:bg-white/10")
                  }
                  onMouseDown={(e) => {
                    // Prevent blur from firing before click
                    e.preventDefault();
                    handleCitySelect(city.name);
                  }}
                >
                  {city.name}
                </li>
              ))}
            </ul>
          )}

          {isOpen &&
            !isDisabled &&
            cityInput.trim().length > 0 &&
            filteredCities.length === 0 && (
              <div
                className={
                  "absolute z-50 mt-1 w-full rounded-lg border border-white/10 " +
                  "bg-[#1a1a1a] px-4 py-3 text-sm text-white/40 shadow-xl"
                }
              >
                No cities found for &ldquo;{cityInput}&rdquo;
              </div>
            )}
        </div>
        {errors?.city && <p className="text-xs text-red-500">{errors.city}</p>}
      </div>
    </div>
  );
}
