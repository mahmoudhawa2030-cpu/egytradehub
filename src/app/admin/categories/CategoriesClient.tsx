"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, Check, X, ToggleLeft, ToggleRight } from "lucide-react";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryActive,
} from "@/app/admin/actions";

type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

const inputCls =
  "w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6A00]";

// ── Create Modal ────────────────────────────────────────────────
function CreateModal({ onClose }: { onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createCategory(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-neutral-900">New Category</h2>
          <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded-lg transition">
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Name *</label>
            <input name="name" required placeholder="e.g. Construction" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Icon (Lucide name)</label>
              <input name="icon" placeholder="e.g. Hammer" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Sort Order</label>
              <input name="sort_order" type="number" defaultValue={0} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
            <textarea name="description" rows={2} placeholder="Optional description..." className={`${inputCls} resize-none`} />
          </div>
          <input type="hidden" name="is_active" value="true" />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2 bg-[#FF6A00] text-white rounded-lg text-sm font-semibold hover:bg-[#FF8C00] transition disabled:opacity-60"
            >
              <Plus className="w-4 h-4" />
              {isPending ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit Row ────────────────────────────────────────────────────
function EditRow({ cat, onDone }: { cat: Category; onDone: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("is_active", cat.is_active ? "true" : "false");
    startTransition(async () => {
      const result = await updateCategory(cat.id, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        onDone();
      }
    });
  }

  return (
    <tr className="bg-orange-50">
      <td colSpan={6} className="px-6 py-4">
        {error && <p className="text-red-600 text-xs mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-3 items-end">
          <div className="col-span-3">
            <label className="block text-xs font-medium text-neutral-600 mb-1">Name *</label>
            <input name="name" required defaultValue={cat.name} className={inputCls} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-neutral-600 mb-1">Icon</label>
            <input name="icon" defaultValue={cat.icon ?? ""} placeholder="Monitor" className={inputCls} />
          </div>
          <div className="col-span-4">
            <label className="block text-xs font-medium text-neutral-600 mb-1">Description</label>
            <input name="description" defaultValue={cat.description ?? ""} className={inputCls} />
          </div>
          <div className="col-span-1">
            <label className="block text-xs font-medium text-neutral-600 mb-1">Order</label>
            <input name="sort_order" type="number" defaultValue={cat.sort_order} className={inputCls} />
          </div>
          <div className="col-span-2 flex gap-2 justify-end">
            <button
              type="submit"
              disabled={isPending}
              title="Save"
              className="p-2 bg-[#FF6A00] text-white rounded-lg hover:bg-[#FF8C00] transition disabled:opacity-60"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onDone}
              title="Cancel"
              className="p-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>
      </td>
    </tr>
  );
}

// ── Main Component ──────────────────────────────────────────────
export default function CategoriesClient({ categories }: { categories: Category[] }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    setDeletingId(id);
    startTransition(async () => {
      await deleteCategory(id);
      setDeletingId(null);
    });
  }

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => {
      await toggleCategoryActive(id, !current);
    });
  }

  return (
    <>
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-neutral-500">{categories.length} categories</p>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF6A00] text-white rounded-lg font-medium text-sm hover:bg-[#FF8C00] transition"
        >
          <Plus className="w-4 h-4" />
          New Category
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        {categories.length === 0 ? (
          <p className="p-12 text-center text-neutral-400">No categories yet. Create one above.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Slug</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Icon</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Description</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-700">Order</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-700">Active</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {categories.map((cat) =>
                editingId === cat.id ? (
                  <EditRow key={cat.id} cat={cat} onDone={() => setEditingId(null)} />
                ) : (
                  <tr key={cat.id} className="hover:bg-neutral-50 transition">
                    <td className="px-6 py-4 font-medium text-neutral-900">{cat.name}</td>
                    <td className="px-6 py-4 text-sm text-neutral-500 font-mono">{cat.slug}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{cat.icon ?? "—"}</td>
                    <td className="px-6 py-4 text-sm text-neutral-500 max-w-[220px] truncate">
                      {cat.description || "—"}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-neutral-600">{cat.sort_order}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggle(cat.id, cat.is_active)}
                        disabled={isPending}
                        title={cat.is_active ? "Deactivate" : "Activate"}
                        className="inline-flex items-center disabled:opacity-60"
                      >
                        {cat.is_active ? (
                          <ToggleRight className="w-6 h-6 text-[#FF6A00]" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-neutral-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingId(cat.id)}
                          title="Edit"
                          className="p-2 hover:bg-neutral-100 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4 text-neutral-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          disabled={deletingId === cat.id || isPending}
                          title="Delete"
                          className="p-2 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
