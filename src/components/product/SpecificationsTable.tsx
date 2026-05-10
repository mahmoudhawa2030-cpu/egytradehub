"use client";

import { useState } from "react";
import { Plus, X, GripVertical } from "lucide-react";

interface SpecEntry {
  key: string;
  value: string;
}

interface SpecificationsTableProps {
  defaultSpecs?: Record<string, string>;
  onChange?: (specs: Record<string, string>) => void;
  readOnly?: boolean;
}

// Default cement specifications template
const CEMENT_TEMPLATE: SpecEntry[] = [
  { key: "Type", value: "" },
  { key: "Strength Grade(Mpa)", value: "" },
  { key: "Heat of Hydration", value: "" },
  { key: "Hardening Feature", value: "" },
  { key: "Application", value: "" },
  { key: "After-sale Service", value: "" },
  { key: "Warranty", value: "" },
  { key: "Project Solution Capability", value: "" },
  { key: "Design Style", value: "" },
  { key: "Place of Origin", value: "" },
  { key: "Brand Name", value: "" },
  { key: "Model Number", value: "" },
  { key: "Time of Setting - Initial set (Min)", value: "" },
  { key: "Time of Setting - Final set (Min)", value: "" },
  { key: "Fineness Test,m2/kg", value: "" },
  { key: "Compressive Strength(MPa) @ 2 days", value: "" },
  { key: "Compressive Strength(MPa) @ 7 days", value: "" },
  { key: "Compressive Strength(MPa) @ 28 days", value: "" },
];

export default function SpecificationsTable({
  defaultSpecs = {},
  onChange,
  readOnly = false,
}: SpecificationsTableProps) {
  // Convert defaultSpecs to entries array
  const initialEntries: SpecEntry[] =
    Object.keys(defaultSpecs).length > 0
      ? Object.entries(defaultSpecs).map(([key, value]) => ({ key, value }))
      : [];

  const [entries, setEntries] = useState<SpecEntry[]>(initialEntries);

  function updateEntries(newEntries: SpecEntry[]) {
    setEntries(newEntries);
    if (onChange) {
      const specs: Record<string, string> = {};
      newEntries.forEach((e) => {
        if (e.key.trim()) specs[e.key.trim()] = e.value;
      });
      onChange(specs);
    }
  }

  function addEntry() {
    updateEntries([...entries, { key: "", value: "" }]);
  }

  function removeEntry(index: number) {
    const newEntries = entries.filter((_, i) => i !== index);
    updateEntries(newEntries);
  }

  function updateEntry(index: number, field: "key" | "value", val: string) {
    const newEntries = entries.map((e, i) =>
      i === index ? { ...e, [field]: val } : e
    );
    updateEntries(newEntries);
  }

  function loadCementTemplate() {
    // Merge existing entries with template, keeping existing values
    const existingMap = new Map(entries.map((e) => [e.key, e.value]));
    const merged = CEMENT_TEMPLATE.map((t) => ({
      key: t.key,
      value: existingMap.get(t.key) || t.value,
    }));
    // Add any extra entries not in template
    const templateKeys = new Set(CEMENT_TEMPLATE.map((t) => t.key));
    const extras = entries.filter((e) => !templateKeys.has(e.key));
    updateEntries([...merged, ...extras]);
  }

  if (readOnly) {
    if (entries.length === 0 && Object.keys(defaultSpecs).length === 0) {
      return null;
    }
    const displayEntries =
      entries.length > 0 ? entries : Object.entries(defaultSpecs).map(([key, value]) => ({ key, value }));
    return (
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody className="divide-y divide-neutral-100">
              {displayEntries.map((entry, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-neutral-50/50"}>
                  <td className="px-4 py-3 text-sm font-medium text-neutral-700 w-1/3 border-r border-neutral-100">
                    {entry.key}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {entry.value || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Template buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={loadCementTemplate}
          className="text-xs px-3 py-1.5 bg-orange-50 text-[#FF6A00] rounded-lg hover:bg-orange-100 transition font-medium"
        >
          Load Cement Template
        </button>
        <button
          type="button"
          onClick={() => updateEntries([])}
          className="text-xs px-3 py-1.5 text-neutral-500 hover:text-neutral-700 transition"
        >
          Clear All
        </button>
      </div>

      {/* Entries */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-neutral-600 w-1/3">
                  Specification
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-neutral-600">
                  Value
                </th>
                <th className="px-2 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-sm text-neutral-400">
                    No specifications added. Click "Add Specification" or "Load Cement Template"
                  </td>
                </tr>
              ) : (
                entries.map((entry, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-neutral-50/30"}>
                    <td className="px-2 py-2 border-r border-neutral-100">
                      <input
                        type="text"
                        value={entry.key}
                        onChange={(e) => updateEntry(index, "key", e.target.value)}
                        placeholder="e.g. Strength Grade"
                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6A00] bg-white"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={entry.value}
                        onChange={(e) => updateEntry(index, "value", e.target.value)}
                        placeholder="e.g. 52.5R"
                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6A00] bg-white"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => removeEntry(index)}
                        className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add button */}
      <button
        type="button"
        onClick={addEntry}
        className="w-full py-2.5 border-2 border-dashed border-neutral-200 rounded-xl text-sm font-medium text-neutral-500 hover:border-[#FF6A00] hover:text-[#FF6A00] hover:bg-orange-50/50 transition flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Specification
      </button>

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name="specifications"
        value={JSON.stringify(
          entries.reduce((acc, e) => {
            if (e.key.trim()) acc[e.key.trim()] = e.value;
            return acc;
          }, {} as Record<string, string>)
        )}
      />
    </div>
  );
}
