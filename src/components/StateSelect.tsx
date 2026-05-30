import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const OTHER = "__other__";

interface StateSelectProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
}

export const StateSelect = ({ value, onChange, id, placeholder = "Select state" }: StateSelectProps) => {
  const isInList = !!value && INDIAN_STATES.includes(value);
  const [mode, setMode] = useState<"list" | "other">(value && !isInList ? "other" : "list");

  useEffect(() => {
    if (value && !INDIAN_STATES.includes(value)) setMode("other");
  }, [value]);

  const handleSelect = (v: string) => {
    if (v === OTHER) {
      setMode("other");
      onChange("");
    } else {
      setMode("list");
      onChange(v);
    }
  };

  return (
    <div className="space-y-2">
      <Select value={mode === "other" ? OTHER : value || undefined} onValueChange={handleSelect}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {INDIAN_STATES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
          <SelectItem value={OTHER}>Other (specify)</SelectItem>
        </SelectContent>
      </Select>
      {mode === "other" && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter state / region"
        />
      )}
    </div>
  );
};
