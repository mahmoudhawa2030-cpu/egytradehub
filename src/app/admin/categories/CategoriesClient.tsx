"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, Check, X, ToggleLeft, ToggleRight, ChevronRight } from "lucide-react";
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
  thumbnail_url: string | null;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  parent_id: string | null;
  created_at: string;
};

const inputCls =
  "w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6A00]";

// ── Category Form Modal ─────────────────────────────────────────
function CategoryModal({
  onClose,
  parents,
  editing,
}: {
  onClose: () => void;
  parents: Category[];
  editing?: Category;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!editing;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (isEdit) formData.set("is_active", editing!.is_active ? "true" : "false");
    startTransition(async () => {
      const result = isEdit
        ? await updateCategory(editing!.id, formData)
        : await createCategory(formData);
      if (result?.error) setError(result.error);
      else onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-neutral-900">
            {isEdit ? "Edit Category" : "New Category"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded-lg transition">
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Parent category */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Parent Category</label>
            <select
              name="parent_id"
              defaultValue={editing?.parent_id ?? ""}
              className={inputCls}
            >
              <option value="">— None (top-level category) —</option>
              {parents
                .filter((p) => p.parent_id === null && p.id !== editing?.id)
                .map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
            </select>
            <p className="text-xs text-neutral-400 mt-1">Select a parent to make this a subcategory.</p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Name *</label>
            <input name="name" required defaultValue={editing?.name ?? ""} placeholder="e.g. Industrial Pumps" className={inputCls} />
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Thumbnail URL</label>
            <input
              name="thumbnail_url"
              type="url"
              defaultValue={editing?.thumbnail_url ?? ""}
              placeholder="https://example.com/image.jpg"
              className={inputCls}
            />
            {editing?.thumbnail_url && (
              <img
                src={editing.thumbnail_url}
                alt="thumbnail"
                className="mt-2 h-16 w-24 object-cover rounded-lg border border-neutral-200"
              />
            )}
          </div>

          {/* Icon + Sort Order */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Icon (Lucide name)</label>
              <input name="icon" defaultValue={editing?.icon ?? ""} placeholder="e.g. Hammer" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Sort Order</label>
              <input name="sort_order" type="number" defaultValue={editing?.sort_order ?? 0} className={inputCls} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
            <textarea
              name="description"
              rows={2}
              defaultValue={editing?.description ?? ""}
              placeholder="Optional description..."
              className={`${inputCls} resize-none`}
            />
          </div>

          {!isEdit && <input type="hidden" name="is_active" value="true" />}

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
              {isPending ? "Saving..." : isEdit ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Category Row ────────────────────────────────────────────────
function CategoryRow({
  cat,
  allCategories,
  depth,
  onEdit,
  onDelete,
  onToggle,
  deletingId,
  isPending,
}: {
  cat: Category;
  allCategories: Category[];
  depth: number;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, current: boolean) => void;
  deletingId: string | null;
  isPending: boolean;
}) {
  const children = allCategories.filter((c) => c.parent_id === cat.id);

  return (
    <>
      <tr className="hover:bg-neutral-50 transition">
        <td className="px-6 py-3">
          <div className="flex items-center gap-2" style={{ paddingLeft: depth * 20 }}>
            {depth > 0 && <ChevronRight className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />}
            {cat.thumbnail_url ? (
              <img src={cat.thumbnail_url} alt={cat.name} className="w-8 h-8 rounded-lg object-cover border border-neutral-200 flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                <span className="text-[#FF6A00] text-xs font-bold">{cat.name.charAt(0)}</span>
              </div>
            )}
            <div>
              <p className={`font-medium text-neutral-900 text-sm ${depth > 0 ? "text-neutral-600" : ""}`}>{cat.name}</p>
              <p className="text-xs text-neutral-400 font-mono">{cat.slug}</p>
            </div>
          </div>
        </td>
        <td className="px-6 py-3 text-sm text-neutral-500">{cat.icon ?? "—"}</td>
        <td className="px-6 py-3 text-sm text-neutral-500 max-w-[200px] truncate">{cat.description || "—"}</td>
        <td className="px-6 py-3 text-center text-sm text-neutral-600">{cat.sort_order}</td>
        <td className="px-6 py-3 text-center">
          <button
            onClick={() => onToggle(cat.id, cat.is_active)}
            disabled={isPending}
            className="inline-flex items-center disabled:opacity-60"
          >
            {cat.is_active
              ? <ToggleRight className="w-6 h-6 text-[#FF6A00]" />
              : <ToggleLeft className="w-6 h-6 text-neutral-400" />}
          </button>
        </td>
        <td className="px-6 py-3 text-right">
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => onEdit(cat)}
              className="p-1.5 hover:bg-neutral-100 rounded-lg transition"
              title="Edit"
            >
              <Edit2 className="w-4 h-4 text-neutral-500" />
            </button>
            <button
              onClick={() => onDelete(cat.id)}
              disabled={deletingId === cat.id || isPending}
              className="p-1.5 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </td>
      </tr>
      {children.map((child) => (
        <CategoryRow
          key={child.id}
          cat={child}
          allCategories={allCategories}
          depth={depth + 1}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggle={onToggle}
          deletingId={deletingId}
          isPending={isPending}
        />
      ))}
    </>
  );
}

// ── Main Component ──────────────────────────────────────────────
export default function CategoriesClient({ categories }: { categories: Category[] }) {
  const [modal, setModal] = useState<{ open: boolean; editing?: Category }>({ open: false });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!confirm("Delete this category and all its subcategories?")) return;
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

  const topLevel = categories.filter((c) => c.parent_id === null);
  const totalSubs = categories.filter((c) => c.parent_id !== null).length;

  return (
    <>
      {modal.open && (
        <CategoryModal
          onClose={() => setModal({ open: false })}
          parents={categories}
          editing={modal.editing}
        />
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-neutral-500">
          {topLevel.length} categories · {totalSubs} subcategories
        </p>
        <button
          onClick={() => setModal({ open: true })}
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wide">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wide">Icon</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wide">Description</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wide">Order</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wide">Active</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {topLevel.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  cat={cat}
                  allCategories={categories}
                  depth={0}
                  onEdit={(c) => setModal({ open: true, editing: c })}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                  deletingId={deletingId}
                  isPending={isPending}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
