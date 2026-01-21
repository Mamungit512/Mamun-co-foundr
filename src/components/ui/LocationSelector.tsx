"use client";

import { useEffect, useState } from "react";
import { Country, City, ICountry, ICity } from "country-state-city";

type LocationSelectorProps = {
  countryValue: string;
  cityValue: string;
  onCountryChange: (country: string) => void;
  onCityChange: (city: string) => void;
  errors?: {
    country?: string;
    city?: string;
  };
};

export default function LocationSelector({
  countryValue,
  cityValue,
  onCountryChange,
  onCityChange,
  errors,
}: LocationSelectorProps) {
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [selectedCountryIso, setSelectedCountryIso] = useState("");

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
    if (!selectedCountryIso) {
      setCities([]);
      return;
    }

    const data = City.getCitiesOfCountry(selectedCountryIso) || [];
    setCities(data);
  }, [selectedCountryIso]);

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
            const country = countries.find((c) => c.isoCode === iso);
            onCountryChange(country?.name || "");
            onCityChange("");
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
      </div>
    </div>
  );
}
