"use client";

import { useEffect, useState } from "react";
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

export default function LocationSelector({
  countryValue,
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
  const [useManualInput, setUseManualInput] = useState(false);
  const [useStatesAsSecondLevel, setUseStatesAsSecondLevel] = useState(false);
  const [manualCountryInput, setManualCountryInput] = useState(false);
  const [manualCityInput, setManualCityInput] = useState(false);

  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  useEffect(() => {
    if (countryValue && countries.length > 0 && !manualCountryInput) {
      const country = countries.find((c) => c.name === countryValue);
      if (country) {
        setSelectedCountryIso(country.isoCode);
      }
    }
  }, [countryValue, countries, manualCountryInput]);

  useEffect(() => {
    if (!selectedCountryIso || manualCountryInput) {
      setStates([]);
      setCities([]);
      setUseManualInput(false);
      setUseStatesAsSecondLevel(false);
      return;
    }

    const statesData = State.getStatesOfCountry(selectedCountryIso) || [];
    if (statesData.length > 0) {
      setStates(statesData);
      setCities([]);
      setUseStatesAsSecondLevel(true);
      setUseManualInput(false);
      return;
    }

    const data = City.getCitiesOfCountry(selectedCountryIso) || [];

    setCities(data);
    setStates([]);
    setUseStatesAsSecondLevel(false);

    setUseManualInput(data.length === 0);
  }, [selectedCountryIso, manualCountryInput]);

  const selectClass =
    "w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-2.5 text-white " +
    "focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

  const buttonClass =
    "text-xs text-blue-400 hover:text-blue-300 underline cursor-pointer";

  return (
    <div className="space-y-4">
      {/* Country Field */}
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">Country *</label>
          <button
            type="button"
            className={buttonClass}
            onClick={() => {
              setManualCountryInput(!manualCountryInput);
              setSelectedCountryIso("");
              onCountryChange("");
              onStateChange("");
              onCityChange?.("");
              setManualCityInput(false);
            }}
          >
            {manualCountryInput ? "Select from list" : "Enter manually"}
          </button>
        </div>

        {manualCountryInput ? (
          <input
            className={selectClass}
            value={countryValue}
            placeholder="Type your country"
            onChange={(e) => onCountryChange(e.target.value)}
          />
        ) : (
          <select
            className={selectClass}
            value={selectedCountryIso}
            onChange={(e) => {
              const iso = e.target.value;
              setSelectedCountryIso(iso);
              const country = countries.find((c) => c.isoCode === iso);
              onCountryChange(country?.name || "");
              onStateChange("");
              onCityChange?.("");
            }}
          >
            <option value="">Select a country</option>
            {countries.map((c) => (
              <option key={c.isoCode} value={c.isoCode}>
                {c.name}
              </option>
            ))}
          </select>
        )}
        {errors?.country && (
          <p className="text-xs text-red-500">{errors.country}</p>
        )}
      </div>

      {/* State/City Field */}
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">
            State / City *
          </label>
          {!manualCountryInput && selectedCountryIso && !useManualInput && (
            <button
              type="button"
              className={buttonClass}
              onClick={() => {
                setManualCityInput(!manualCityInput);
                if (!manualCityInput) {
                  onCityChange?.("");
                }
              }}
            >
              {manualCityInput ? "Select from list" : "Enter manually"}
            </button>
          )}
        </div>

        {useManualInput || manualCityInput || manualCountryInput ? (
          <input
            className={selectClass}
            value={cityValue || ""}
            disabled={!selectedCountryIso && !manualCountryInput}
            placeholder={
              !selectedCountryIso && !manualCountryInput
                ? "First select a country"
                : "Type your state or city"
            }
            onChange={(e) => onCityChange?.(e.target.value)}
          />
        ) : (
          <select
            className={selectClass}
            value={cityValue || ""}
            disabled={!selectedCountryIso}
            onChange={(e) => onCityChange?.(e.target.value)}
          >
            <option value="">
              {!selectedCountryIso
                ? "First select a country"
                : useStatesAsSecondLevel
                  ? "Select a state/province"
                  : cities.length === 0
                    ? "No options available"
                    : "Select a city"}
            </option>
            {useStatesAsSecondLevel
              ? states.map((s) => (
                  <option key={s.isoCode} value={s.name}>
                    {s.name}
                  </option>
                ))
              : cities.map((city, index) => (
                  <option
                    key={`${city.name}-${city.stateCode}-${index}`}
                    value={city.name}
                  >
                    {city.name}
                  </option>
                ))}
          </select>
        )}
        {errors?.city && <p className="text-xs text-red-500">{errors.city}</p>}
      </div>
    </div>
  );
}
