import { Filter } from "../types";

interface Props {
  filter: Filter;
  onChange: (f: Filter) => void;
}

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "done", label: "Done" },
];

export default function FilterBar({ filter, onChange }: Props) {
  return (
    <div className="filters">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          className={filter === f.value ? "active" : ""}
          onClick={() => onChange(f.value)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
