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

  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  useEffect(() => {
    if (countryValue && countries.length > 0) {
      const country = countries.find((c) => c.name === countryValue);
      if (country) {
        setSelectedCountryIso(country.isoCode);
      }
    }
  }, [countryValue, countries]);

  useEffect(() => {
    if (stateValue && states.length > 0) {
      const state = states.find((s) => s.name === stateValue);
      if (state) {
        setSelectedStateIso(state.isoCode);
      }
    }
  }, [stateValue, states]);

  useEffect(() => {
    if (!selectedCountryIso) {
      setStates([]);
      setIsUS(false);
      return;
    }

    // Check if the selected country is US
    const countryIsUS = selectedCountryIso === "US";
    setIsUS(countryIsUS);

    // Only fetch states if country is US
    if (countryIsUS) {
      const data = State.getStatesOfCountry(selectedCountryIso) || [];
      setStates(data);
    } else {
      setStates([]);
    }
  }, [selectedCountryIso]);

  // Fetch cities based on country and state selection
  useEffect(() => {
    if (!selectedCountryIso) {
      setCities([]);
      return;
    }

    // For US with a state selected, get cities of that state
    // For US without state or non-US countries, get cities of the country
    const data = selectedStateIso
      ? City.getCitiesOfState(selectedCountryIso, selectedStateIso) || []
      : City.getCitiesOfCountry(selectedCountryIso) || [];

    setCities(data);
  }, [selectedCountryIso, selectedStateIso]);

  const selectClass =
    "w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-2.5 text-white " +
    "focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="space-y-4">
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
            // Reset city when country changes
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
        {errors?.country && (
          <p className="text-xs text-red-500">{errors.country}</p>
        )}
      </div>

      {/* Only show State dropdown for US */}
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
              // Reset city when state changes
              onCityChange?.("");
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

      {/* City dropdown for all countries */}
      <div className="flex flex-col gap-y-2">
        <label className="text-sm font-medium text-gray-300">City *</label>
        <select
          className={selectClass}
          value={cityValue || ""}
          disabled={!selectedCountryIso || (isUS && !selectedStateIso)}
          onChange={(e) => onCityChange?.(e.target.value)}
        >
          <option value="">
            {!selectedCountryIso
              ? "First select a country"
              : isUS && !selectedStateIso
                ? "First select a state"
                : cities.length === 0
                  ? "No cities available"
                  : "Select a city"}
          </option>
          {cities.map((city, index) => (
            <option
              key={`${city.name}-${city.stateCode}-${index}`}
              value={city.name}
            >
              {city.name}
            </option>
          ))}
        </select>
        {errors?.city && <p className="text-xs text-red-500">{errors.city}</p>}
      </div>
    </div>
  );
}
