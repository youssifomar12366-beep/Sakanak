import "../styles/LocationInput.css";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { locationSuggestions, normalizeLocation } from "../utils/location";
import { useStore } from "../store/useStore";
import { translate } from "../locales";

function LocationInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const language = useStore((state) => state.language);
  const [focused, setFocused] = useState(false);
  const suggestions = value
    ? locationSuggestions
        .filter((item) =>
          normalizeLocation(item).includes(normalizeLocation(value)),
        )
        .slice(0, 6)
    : [];
  return (
    <div className="location-input">
      <div className="location-control">
        <SlidersHorizontal size={16} />
        <input
          dir="auto"
          value={value}
          onFocus={() => setFocused(true)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        {value && (
          <button
            type="button"
            aria-label={translate(language, "clearLocation")}
            onClick={() => onChange("")}
          >
            <X size={15} />
          </button>
        )}
      </div>
      {focused && suggestions.length > 0 && (
        <div className="suggestions" role="listbox">
          {suggestions.map((item) => (
            <button
              type="button"
              role="option"
              key={item}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(item);
                setFocused(false);
              }}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LocationInput;
