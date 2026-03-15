"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Search, Loader2, X, Upload } from "lucide-react";
import { formatPrice, cloudinaryUrl, slugify, cn } from "@/lib/utils";
import { toast } from "@/components/Toaster";
import { useDropzone } from "react-dropzone";

interface Product {
  id: string; name: string; slug: string; description: string;
  longDesc?: string | null; price: number; comparePrice?: number | null;
  unit: string; stock: number; category: string; images: string[];
  featured: boolean; isActive: boolean; sortOrder: number;
}

const CATS = [
  "Color Powders", "Exercise Books", "Soaps",
  "Washing Powder", "Bleaching Powder", "Other",
];

// ─── Image Uploader ────────────────────────────────────────────────────────────
function ImgUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (imgs: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const toUpload = acceptedFiles.slice(0, 8 - images.length);
      if (!toUpload.length) return;

      setUploading(true);
      setProgress("Getting credentials...");

      try {
        // 1. Get signed params from our server
        const paramRes = await fetch("/api/upload", { method: "POST" });
        if (!paramRes.ok) {
          const err = await paramRes.json().catch(() => ({}));
          throw new Error(
            err.error || "Could not get upload credentials. Check CLOUDINARY_API_SECRET in .env"
          );
        }

        const { signature, timestamp, cloudName, apiKey, folder } =
          await paramRes.json();

        if (!cloudName || !apiKey || !signature) {
          throw new Error(
            "Cloudinary credentials missing. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in your .env file."
          );
        }

        const uploaded: string[] = [];

        // 2. Upload each file directly to Cloudinary — NO upload_preset needed
        for (let i = 0; i < toUpload.length; i++) {
          const file = toUpload[i];
          setProgress(`Uploading ${i + 1} of ${toUpload.length}...`);

          const fd = new FormData();
          fd.append("file", file);
          fd.append("api_key", apiKey);
          fd.append("timestamp", String(timestamp));
          fd.append("signature", signature);
          fd.append("folder", folder);
          // ✅ No upload_preset — signed upload doesn't need it

          const res = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            { method: "POST", body: fd }
          );

          const data = await res.json();

          if (!res.ok || data.error) {
            throw new Error(
              data.error?.message || `Cloudinary rejected the upload (${res.status}). Check your API credentials.`
            );
          }

          if (data.secure_url) uploaded.push(data.secure_url);
        }

        onChange([...images, ...uploaded]);
        toast(`${uploaded.length} image(s) uploaded`, "success");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        toast(msg, "error");
        console.error("Upload error:", err);
      } finally {
        setUploading(false);
        setProgress("");
      }
    },
    [images, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
      "image/gif": [],
    },
    multiple: true,
    disabled: uploading || images.length >= 8,
    maxSize: 10 * 1024 * 1024,
  });

  const remove = (url: string) => {
    fetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    }).catch(() => {});
    onChange(images.filter((i) => i !== url));
  };

  return (
    <div className="space-y-3">
      {/* Thumbnails */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, i) => (
            <div
              key={url}
              className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-800 group border border-gray-700"
            >
              <Image
                src={cloudinaryUrl(url, 120, 120)}
                alt={`Image ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
              {i === 0 && (
                <span className="absolute top-0.5 left-0.5 bg-[#D72638] text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                  Main
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(url)}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {images.length < 8 && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 text-center transition-colors",
            uploading
              ? "border-gray-700 bg-gray-800/40 cursor-not-allowed"
              : isDragActive
              ? "border-[#D72638] bg-[#D72638]/10 cursor-copy"
              : "border-gray-700 hover:border-gray-500 hover:bg-gray-800/30 cursor-pointer"
          )}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#D72638]" />
              <p className="text-gray-400 text-sm">{progress}</p>
            </div>
          ) : (
            <>
              <Upload className="w-6 h-6 mx-auto text-gray-500 mb-2" />
              <p className="text-gray-300 text-sm font-medium">
                {isDragActive ? "Drop images here" : "Click or drag images to upload"}
              </p>
              <p className="text-gray-600 text-xs mt-1">
                JPG, PNG, WebP · Max 10 MB each · {images.length} / 8 uploaded
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Add / Edit Modal ──────────────────────────────────────────────────────────
function Modal({
  product,
  onClose,
  onSaved,
}: {
  product?: Product;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!product?.id;

  const blank = {
    name: "", slug: "", description: "", longDesc: "", price: 0,
    comparePrice: null as number | null, unit: "", stock: 0,
    category: "", images: [] as string[], featured: false,
    isActive: true, sortOrder: 0,
  };

  const [form, setForm] = useState(
    product
      ? {
          name: product.name,
          slug: product.slug,
          description: product.description,
          longDesc: product.longDesc || "",
          price: product.price,
          comparePrice: product.comparePrice ?? null,
          unit: product.unit,
          stock: product.stock,
          category: product.category,
          images: product.images,
          featured: product.featured,
          isActive: product.isActive,
          sortOrder: product.sortOrder,
        }
      : blank
  );

  const [saving, setSaving] = useState(false);

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const setName = (v: string) => {
    set("name", v);
    if (!isEdit) set("slug", slugify(v));
  };

  const iC =
    "w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D72638]/30 placeholder-gray-600";
  const lC = "block text-xs font-medium text-gray-400 mb-1.5";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.images.length) {
      toast("Please upload at least one product image", "error");
      return;
    }
    setSaving(true);
    try {
      const url = isEdit ? `/api/products/${product!.id}` : "/api/products";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save product");
      }
      toast(isEdit ? "Product updated!" : "Product created!", "success");
      onSaved();
      onClose();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/70 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="font-display font-bold text-white text-lg">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          {/* Images */}
          <div>
            <label className={lC}>
              Product Images *{" "}
              <span className="text-gray-600 font-normal">
                (first image = main display image)
              </span>
            </label>
            <ImgUploader
              images={form.images}
              onChange={(imgs) => set("images", imgs)}
            />
          </div>

          {/* Name + Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={lC}>Product Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setName(e.target.value)}
                className={iC}
                placeholder="Red Gulal Powder"
              />
            </div>
            <div>
              <label className={lC}>URL Slug *</label>
              <input
                required
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                className={cn(iC, "font-mono text-xs")}
                placeholder="red-gulal-powder"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className={lC}>Category *</label>
            <select
              required
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className={cn(iC, "bg-gray-800")}
            >
              <option value="">Select a category</option>
              {CATS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Price, Compare Price, Unit, Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lC}>Price (Rs.) *</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => set("price", parseFloat(e.target.value) || 0)}
                className={iC}
              />
            </div>
            <div>
              <label className={lC}>
                Compare Price{" "}
                <span className="text-gray-600">(original / strikethrough)</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.comparePrice ?? ""}
                onChange={(e) =>
                  set(
                    "comparePrice",
                    e.target.value ? parseFloat(e.target.value) : null
                  )
                }
                className={iC}
                placeholder="Leave blank if no discount"
              />
            </div>
            <div>
              <label className={lC}>Unit *</label>
              <input
                required
                value={form.unit}
                onChange={(e) => set("unit", e.target.value)}
                className={iC}
                placeholder="per kg / per pack / each"
              />
            </div>
            <div>
              <label className={lC}>Stock *</label>
              <input
                required
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) =>
                  set("stock", parseInt(e.target.value) || 0)
                }
                className={iC}
              />
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className={lC}>
              Short Description *{" "}
              <span className="text-gray-600">(shown on product card)</span>
            </label>
            <textarea
              required
              rows={2}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={cn(iC, "resize-none")}
              placeholder="Brief description shown on the product card..."
            />
          </div>

          {/* Long Description */}
          <div>
            <label className={lC}>
              Long Description{" "}
              <span className="text-gray-600">(optional, shown in popup)</span>
            </label>
            <textarea
              rows={3}
              value={form.longDesc || ""}
              onChange={(e) => set("longDesc", e.target.value)}
              className={cn(iC, "resize-none")}
              placeholder="Detailed product description..."
            />
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="w-4 h-4 accent-[#D72638]"
              />
              <span className="text-sm text-gray-300">Featured on homepage</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => set("isActive", e.target.checked)}
                className="w-4 h-4 accent-[#D72638]"
              />
              <span className="text-sm text-gray-300">
                Active (visible in store)
              </span>
            </label>
          </div>

          {/* Footer buttons */}
          <div className="flex gap-3 pt-2 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-700 rounded-xl text-gray-400 text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              style={{
                background: "linear-gradient(135deg,#D72638,#FF8C00)",
              }}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Products Page ─────────────────────────────────────────────────────────────
export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ open: boolean; p?: Product }>({
    open: false,
  });
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetch("/api/products?admin=1").then((r) => r.json());
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      toast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = async (id: string, field: string, val: boolean) => {
    await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: val }),
    });
    setProducts((ps) =>
      ps.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  const del = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    setDeleting(p.id);
    const res = await fetch(`/api/products/${p.id}`, { method: "DELETE" });
    if (res.ok) {
      toast("Product deleted", "success");
      setProducts((ps) => ps.filter((x) => x.id !== p.id));
    } else {
      toast("Delete failed", "error");
    }
    setDeleting(null);
  };

  const stockColor = (s: number) =>
    s === 0 ? "text-red-400" : s <= 10 ? "text-orange-400" : "text-green-400";

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-white">
          Products ({products.length})
        </h1>
        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg,#D72638,#FF8C00)" }}
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D72638]/30 placeholder-gray-600"
        />
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[#D72638]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {[
                    "Image", "Name", "Category", "Price",
                    "Stock", "Featured", "Active", "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className={cn(
                      "border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors",
                      deleting === p.id && "opacity-40"
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-800 border border-gray-700">
                        {p.images[0] ? (
                          <Image
                            src={cloudinaryUrl(p.images[0], 100, 100)}
                            alt=""
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">
                            🎨
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[160px]">
                      <p className="text-white font-medium text-xs line-clamp-2">
                        {p.name}
                      </p>
                      <p className="text-gray-600 text-[10px] font-mono mt-0.5">
                        {p.slug}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white font-semibold text-xs whitespace-nowrap">
                      {formatPrice(p.price)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("font-bold text-sm", stockColor(p.stock))}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggle(p.id, "featured", !p.featured)}
                        className={cn(
                          "w-9 h-5 rounded-full transition-colors relative",
                          p.featured ? "bg-[#D72638]" : "bg-gray-700"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow",
                            p.featured ? "right-0.5" : "left-0.5"
                          )}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggle(p.id, "isActive", !p.isActive)}
                        className={cn(
                          "w-9 h-5 rounded-full transition-colors relative",
                          p.isActive ? "bg-green-500" : "bg-gray-700"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow",
                            p.isActive ? "right-0.5" : "left-0.5"
                          )}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setModal({ open: true, p })}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-700 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => del(p)}
                          disabled={deleting === p.id}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete"
                        >
                          {deleting === p.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-16 text-gray-600"
                    >
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal.open && (
        <Modal
          product={modal.p}
          onClose={() => setModal({ open: false })}
          onSaved={load}
        />
      )}
    </div>
  );
}