"use client";

import { useEffect, useState } from "react";
import {
  Country,
  State,
  ICountry,
  IState,
} from "country-state-city";

type LocationSelectorProps = {
  countryValue: string;
  stateValue: string;
  onCountryChange: (country: string) => void;
  onStateChange: (state: string) => void;
  errors?: {
    country?: string;
    state?: string;
  };
};

export default function LocationSelector({
  countryValue,
  stateValue,
  onCountryChange,
  onStateChange,
  errors,
}: LocationSelectorProps) {
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [selectedCountryIso, setSelectedCountryIso] = useState("");
  const [selectedStateIso, setSelectedStateIso] = useState("");

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
      return;
    }

    const data = State.getStatesOfCountry(selectedCountryIso) || [];
    setStates(data);
  }, [selectedCountryIso]);

  // useEffect(() => {
  //   if (!selectedCountryIso) {
  //     return;
  //   }

  //   // If a state is selected, get cities of that state
  //   // Otherwise, get all cities of the country
  //   const data = selectedStateIso
  //     ? City.getCitiesOfState(selectedCountryIso, selectedStateIso) || []
  //     : City.getCitiesOfCountry(selectedCountryIso) || [];
  //   setCities(data);
  // }, [selectedCountryIso, selectedStateIso]);

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

      <div className="flex flex-col gap-y-2">
        <label className="text-sm font-medium text-gray-300">
          City / State {states.length > 0 && "*"}
        </label>
        <select
          className={selectClass}
          value={selectedStateIso}
          disabled={!selectedCountryIso || states.length === 0}
          onChange={(e) => {
            const iso = e.target.value;
            setSelectedStateIso(iso);
            const state = states.find((s) => s.isoCode === iso);
            onStateChange(state?.name || "");
          }}
        >
          <option value="">
            {!selectedCountryIso
              ? "First select a country"
              : states.length === 0
                ? "No states available"
                : "Select a state"}
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

      {/* <div className="flex flex-col gap-y-2">
        <label className="text-sm font-medium text-gray-300">City *</label>
        <select
          className={selectClass}
          value={cityValue}
          disabled={!selectedCountryIso}
          onChange={(e) => onCityChange(e.target.value)}
        >
          <option value="">
            {!selectedCountryIso ? "First select a country" : "Select a city"}
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
      </div> */}
    </div>
  );
}
