"use client";
import { useState, useEffect, useCallback } from "react";
import { Loader2, Save, Upload, X } from "lucide-react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { cloudinaryUrl } from "@/lib/utils";
import { toast } from "@/components/Toaster";

const TABS = ["Store Info", "Contact & Social", "Delivery", "Hero Images"];

type S = {
  storeName: string; tagline: string; ownerName: string; ownerPhone: string;
  ownerEmail: string; whatsappNumber: string; address: string; openingHours: string;
  facebook: string; instagram: string; tiktok: string; deliveryNote: string;
  minOrderNote: string; aboutText: string; heroImages: string[];
};

const EMPTY: S = {
  storeName: "Roja International", tagline: "", ownerName: "", ownerPhone: "",
  ownerEmail: "", whatsappNumber: "", address: "", openingHours: "",
  facebook: "", instagram: "", tiktok: "", deliveryNote: "",
  minOrderNote: "", aboutText: "", heroImages: [],
};

// ─── Hero Image Uploader ────────────────────────────────────────────────────────
function HeroImages({
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
      const toUpload = acceptedFiles.slice(0, 5 - images.length);
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
          setProgress(`Uploading slide ${i + 1} of ${toUpload.length}...`);

          const fd = new FormData();
          fd.append("file", file);
          fd.append("api_key", apiKey);
          fd.append("timestamp", String(timestamp));
          fd.append("signature", signature);
          fd.append("folder", folder);
          // ✅ No upload_preset needed for signed uploads

          const res = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            { method: "POST", body: fd }
          );

          const data = await res.json();

          if (!res.ok || data.error) {
            throw new Error(
              data.error?.message ||
                `Cloudinary rejected the upload (${res.status}). Check your API credentials.`
            );
          }

          if (data.secure_url) uploaded.push(data.secure_url);
        }

        onChange([...images, ...uploaded]);
        toast(`${uploaded.length} hero image(s) uploaded`, "success");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        toast(msg, "error");
        console.error("Hero upload error:", err);
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
    },
    multiple: true,
    disabled: uploading || images.length >= 5,
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
    <div className="space-y-4">
      <p className="text-gray-400 text-xs leading-relaxed">
        Upload up to 5 hero slider images for your homepage.{" "}
        <strong className="text-gray-300">Recommended: 1400 × 600 px, landscape.</strong>
      </p>

      {/* Previews */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((url, i) => (
            <div
              key={url}
              className="relative w-36 h-24 rounded-xl overflow-hidden bg-gray-800 group border border-gray-700"
            >
              <Image
                src={cloudinaryUrl(url, 300, 200)}
                alt={`Slide ${i + 1}`}
                fill
                className="object-cover"
                sizes="144px"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <button
                  type="button"
                  onClick={() => remove(url)}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold">
                Slide {i + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {images.length < 5 && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-7 text-center transition-colors ${
            uploading
              ? "border-gray-700 bg-gray-800/40 cursor-not-allowed"
              : isDragActive
              ? "border-[#D72638] bg-[#D72638]/10 cursor-copy"
              : "border-gray-700 hover:border-gray-500 hover:bg-gray-800/30 cursor-pointer"
          }`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#D72638]" />
              <p className="text-gray-400 text-sm">{progress}</p>
            </div>
          ) : (
            <>
              <Upload className="w-7 h-7 mx-auto text-gray-500 mb-2" />
              <p className="text-gray-300 text-sm font-medium">
                {isDragActive ? "Drop slides here" : "Click or drag hero images here"}
              </p>
              <p className="text-gray-600 text-xs mt-1">
                JPG, PNG, WebP · Max 10 MB · {images.length} / 5 uploaded
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Settings Page ──────────────────────────────────────────────────────────────
export default function AdminSettings() {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState<S>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        setForm(
          Object.fromEntries(
            Object.entries(EMPTY).map(([k]) => [k, d[k] ?? EMPTY[k as keyof S]])
          ) as S
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const set = (k: keyof S, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      toast("Settings saved!", "success");
    } catch (err: unknown) {
      toast(
        err instanceof Error ? err.message : "Failed to save settings",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const iC =
    "w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D72638]/30 placeholder-gray-600";
  const lC = "block text-xs font-medium text-gray-400 mb-1.5";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#D72638]" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-white">
        Store Settings
      </h1>

      {/* Tab bar */}
      <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1 overflow-x-auto gap-1">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              tab === i
                ? "bg-[#D72638] text-white"
                : "text-gray-500 hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">

        {/* ── Store Info ── */}
        {tab === 0 && (
          <>
            <div>
              <label className={lC}>Store Name *</label>
              <input
                value={form.storeName}
                onChange={(e) => set("storeName", e.target.value)}
                className={iC}
                placeholder="Roja International"
              />
            </div>
            <div>
              <label className={lC}>Tagline</label>
              <input
                value={form.tagline}
                onChange={(e) => set("tagline", e.target.value)}
                className={iC}
                placeholder="Sri Lanka's favourite colour store"
              />
            </div>
            <div>
              <label className={lC}>Store Address</label>
              <textarea
                rows={2}
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                className={`${iC} resize-none`}
                placeholder="No. 12, Main Street, Colombo 03"
              />
            </div>
            <div>
              <label className={lC}>Opening Hours</label>
              <input
                value={form.openingHours}
                onChange={(e) => set("openingHours", e.target.value)}
                className={iC}
                placeholder="Mon–Sat: 8am – 8pm"
              />
            </div>
            <div>
              <label className={lC}>
                About Text{" "}
                <span className="text-gray-600">(shown on About Us page)</span>
              </label>
              <textarea
                rows={5}
                value={form.aboutText}
                onChange={(e) => set("aboutText", e.target.value)}
                className={`${iC} resize-none`}
                placeholder="Tell customers about your store..."
              />
            </div>
          </>
        )}

        {/* ── Contact & Social ── */}
        {tab === 1 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lC}>Owner Name</label>
                <input
                  value={form.ownerName}
                  onChange={(e) => set("ownerName", e.target.value)}
                  className={iC}
                  placeholder="Roja Perera"
                />
              </div>
              <div>
                <label className={lC}>Phone Number</label>
                <input
                  value={form.ownerPhone}
                  onChange={(e) => set("ownerPhone", e.target.value)}
                  className={iC}
                  placeholder="+94 77 123 4567"
                />
              </div>
              <div>
                <label className={lC}>Email</label>
                <input
                  type="email"
                  value={form.ownerEmail}
                  onChange={(e) => set("ownerEmail", e.target.value)}
                  className={iC}
                  placeholder="owner@gmail.com"
                />
              </div>
              <div>
                <label className={lC}>WhatsApp Number</label>
                <input
                  value={form.whatsappNumber}
                  onChange={(e) => set("whatsappNumber", e.target.value)}
                  className={iC}
                  placeholder="94771234567"
                />
                <p className="text-gray-600 text-xs mt-1">
                  Country code + number, no + or spaces
                </p>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-4 space-y-3">
              <p className="text-gray-400 text-sm font-medium">Social Media</p>
              <div>
                <label className={lC}>Facebook URL</label>
                <input
                  value={form.facebook}
                  onChange={(e) => set("facebook", e.target.value)}
                  className={iC}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              <div>
                <label className={lC}>Instagram URL</label>
                <input
                  value={form.instagram}
                  onChange={(e) => set("instagram", e.target.value)}
                  className={iC}
                  placeholder="https://instagram.com/yourprofile"
                />
              </div>
              <div>
                <label className={lC}>TikTok URL</label>
                <input
                  value={form.tiktok}
                  onChange={(e) => set("tiktok", e.target.value)}
                  className={iC}
                  placeholder="https://tiktok.com/@yourprofile"
                />
              </div>
            </div>
          </>
        )}

        {/* ── Delivery ── */}
        {tab === 2 && (
          <>
            <div>
              <label className={lC}>Delivery Note</label>
              <input
                value={form.deliveryNote}
                onChange={(e) => set("deliveryNote", e.target.value)}
                className={iC}
                placeholder="Free delivery on orders over Rs. 2,000"
              />
              <p className="text-gray-600 text-xs mt-1">
                Shown in cart, checkout, and the homepage ticker banner
              </p>
            </div>
            <div>
              <label className={lC}>Minimum Order Note</label>
              <input
                value={form.minOrderNote}
                onChange={(e) => set("minOrderNote", e.target.value)}
                className={iC}
                placeholder="Minimum order Rs. 500"
              />
              <p className="text-gray-600 text-xs mt-1">
                Shown in the homepage ticker banner
              </p>
            </div>
          </>
        )}

        {/* ── Hero Images ── */}
        {tab === 3 && (
          <HeroImages
            images={form.heroImages}
            onChange={(imgs) => set("heroImages", imgs)}
          />
        )}
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
        style={{ background: "linear-gradient(135deg,#D72638,#FF8C00)" }}
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Save Settings
          </>
        )}
      </button>
    </div>
  );
}