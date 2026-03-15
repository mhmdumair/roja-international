"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Search, Loader2, X, Upload } from "lucide-react";
import { formatPrice, cloudinaryUrl, slugify, cn } from "@/lib/utils";
import { toast } from "@/components/Toaster";
import { useDropzone } from "react-dropzone";

interface Product { id:string; name:string; slug:string; description:string; longDesc?:string|null; price:number; comparePrice?:number|null; unit:string; stock:number; category:string; images:string[]; featured:boolean; isActive:boolean; sortOrder:number; }
const CATS = ["Color Powders","Exercise Books","Soaps","Washing Powder","Bleaching Powder","Other"];

function ImgUploader({ images, onChange }: { images:string[]; onChange:(i:string[])=>void }) {
  const [uploading, setUploading] = useState(false);
  const onDrop = useCallback(async (files: File[]) => {
    const toUp = files.slice(0, 8 - images.length); if (!toUp.length) return;
    setUploading(true);
    try {
      const res = await fetch("/api/upload",{method:"POST"});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get upload params");
      const { signature, timestamp, cloudName, apiKey, folder, uploadPreset } = data;

      const urls: string[] = [];
      for (const f of toUp) {
        const fd = new FormData();
        fd.append("file",f);
        fd.append("signature",signature);
        fd.append("timestamp",String(timestamp));
        fd.append("api_key",apiKey);
        fd.append("folder",folder);
        if (uploadPreset) fd.append("upload_preset", uploadPreset);

        const d = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,{method:"POST",body:fd}).then(r=>r.json());
        if (d.secure_url) urls.push(d.secure_url);
        else if (d.error) throw new Error(d.error.message);
      }
      if (urls.length) {
        onChange([...images,...urls]);
        toast(`${urls.length} image(s) uploaded`,"success");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      toast(err?.message || "Upload failed","error");
    } finally {
      setUploading(false);
    }
  }, [images, onChange]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept:{"image/*":[]}, multiple:true, disabled: uploading||images.length>=8 });
  const remove = (url:string) => { fetch("/api/upload",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({url})}).catch(()=>{}); onChange(images.filter(i=>i!==url)); };
  return (
    <div className="space-y-2">
      {images.length>0&&<div className="flex flex-wrap gap-2">{images.map((url,i)=>{
        const fileName = url.split("/").pop()?.split("?")[0] || "image";
        return (
          <div key={url} className="flex flex-col items-center gap-1">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-800 group">
              <Image src={cloudinaryUrl(url,120,120)} alt="" fill className="object-cover" sizes="64px"/>
              {i===0&&<span className="absolute top-0.5 left-0.5 bg-[#D72638] text-white text-[8px] font-bold px-1 rounded">Main</span>}
              <button type="button" onClick={()=>remove(url)} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><X className="w-4 h-4 text-white"/></button>
            </div>
            <span className="text-[9px] text-gray-500 truncate w-16 text-center">{fileName}</span>
          </div>
        );
      })}</div>}
      {images.length<8&&<div {...getRootProps()} className={cn("border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors",isDragActive?"border-[#D72638] bg-[#D72638]/5":"border-gray-700 hover:border-gray-600")}><input {...getInputProps()}/>{uploading?<Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-500"/>:<><Upload className="w-5 h-5 mx-auto text-gray-500 mb-1.5"/><p className="text-gray-500 text-xs">Drop or click to upload ({images.length}/8)</p></>}</div>}
    </div>
  );
}

function Modal({ product, onClose, onSaved }: { product?:Product; onClose:()=>void; onSaved:()=>void }) {
  const isEdit = !!product?.id;
  const init = product ? { name:product.name, slug:product.slug, description:product.description, longDesc:product.longDesc||"", price:product.price, comparePrice:product.comparePrice??null, unit:product.unit, stock:product.stock, category:product.category, images:product.images, featured:product.featured, isActive:product.isActive, sortOrder:product.sortOrder } : { name:"",slug:"",description:"",longDesc:"",price:0,comparePrice:null as null|number,unit:"",stock:0,category:"",images:[] as string[],featured:false,isActive:true,sortOrder:0 };
  const [form, setForm] = useState(init);
  const [saving, setSaving] = useState(false);
  const set = (k:string, v:unknown) => setForm(f=>({...f,[k]:v}));
  const setName = (v:string) => { set("name",v); if(!isEdit) set("slug",slugify(v)); };
  const iC = "w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D72638]/30 placeholder-gray-600";
  const lC = "block text-xs font-medium text-gray-400 mb-1";
  const submit = async (e:React.FormEvent) => {
    e.preventDefault(); if (!form.images.length) { toast("Add at least one image","error"); return; }
    setSaving(true);
    try {
      const res = await fetch(isEdit?`/api/products/${product!.id}`:"/api/products",{method:isEdit?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      if (!res.ok) throw new Error((await res.json()).error);
      toast(isEdit?"Product updated!":"Product created!","success"); onSaved(); onClose();
    } catch(err:unknown){toast(err instanceof Error?err.message:"Failed","error");}finally{setSaving(false);}
  };
  return (
    <div className="fixed inset-0 z-[90] bg-black/70 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl my-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="font-display font-bold text-white">{isEdit?"Edit":"Add"} Product</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div><label className={lC}>Images *</label><ImgUploader images={form.images} onChange={imgs=>set("images",imgs)}/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lC}>Name *</label><input required value={form.name} onChange={e=>setName(e.target.value)} className={iC} placeholder="Red Gulal Powder"/></div>
            <div><label className={lC}>Slug *</label><input required value={form.slug} onChange={e=>set("slug",e.target.value)} className={cn(iC,"font-mono text-xs")}/></div>
          </div>
          <div><label className={lC}>Category *</label><select required value={form.category} onChange={e=>set("category",e.target.value)} className={cn(iC,"bg-gray-800")}><option value="">Select category</option>{CATS.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lC}>Price (Rs.) *</label><input required type="number" min="0" step="0.01" value={form.price} onChange={e=>set("price",parseFloat(e.target.value)||0)} className={iC}/></div>
            <div><label className={lC}>Compare Price</label><input type="number" min="0" step="0.01" value={form.comparePrice??""} onChange={e=>set("comparePrice",e.target.value?parseFloat(e.target.value):null)} className={iC} placeholder="Original price"/></div>
            <div><label className={lC}>Unit *</label><input required value={form.unit} onChange={e=>set("unit",e.target.value)} className={iC} placeholder="per kg / per pack"/></div>
            <div><label className={lC}>Stock *</label><input required type="number" min="0" value={form.stock} onChange={e=>set("stock",parseInt(e.target.value)||0)} className={iC}/></div>
          </div>
          <div><label className={lC}>Description *</label><textarea required rows={2} value={form.description} onChange={e=>set("description",e.target.value)} className={cn(iC,"resize-none")}/></div>
          <div><label className={lC}>Long Description</label><textarea rows={3} value={form.longDesc||""} onChange={e=>set("longDesc",e.target.value)} className={cn(iC,"resize-none")}/></div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.featured} onChange={e=>set("featured",e.target.checked)} className="w-4 h-4 accent-[#D72638]"/><span className="text-sm text-gray-300">Featured</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={e=>set("isActive",e.target.checked)} className="w-4 h-4 accent-[#D72638]"/><span className="text-sm text-gray-300">Active</span></label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-700 rounded-xl text-gray-400 text-sm font-semibold hover:bg-gray-800">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2" style={{background:"linear-gradient(135deg,#D72638,#FF8C00)"}}>
              {saving?<><Loader2 className="w-4 h-4 animate-spin"/>Saving...</>:isEdit?"Save Changes":"Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{open:boolean;p?:Product}>({open:false});
  const [deleting, setDeleting] = useState<string|null>(null);
  const load = useCallback(async()=>{ setLoading(true); const d=await fetch("/api/products?admin=1").then(r=>r.json()); setProducts(Array.isArray(d)?d:[]); setLoading(false); },[]);
  useEffect(()=>{load();},[load]);
  const filtered = products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())||p.category.toLowerCase().includes(search.toLowerCase()));
  const toggle = async(id:string,field:string,val:boolean)=>{ await fetch(`/api/products/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({[field]:val})}); setProducts(ps=>ps.map(p=>p.id===id?{...p,[field]:val}:p)); };
  const del = async(p:Product)=>{ if(!confirm(`Delete "${p.name}"?`))return; setDeleting(p.id); const r=await fetch(`/api/products/${p.id}`,{method:"DELETE"}); if(r.ok){toast("Deleted","success");setProducts(ps=>ps.filter(x=>x.id!==p.id));}else toast("Delete failed","error"); setDeleting(null); };
  const sc=(s:number)=>s===0?"text-red-400":s<=10?"text-orange-400":"text-green-400";
  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-white">Products ({products.length})</h1>
        <button onClick={()=>setModal({open:true})} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90" style={{background:"linear-gradient(135deg,#D72638,#FF8C00)"}}><Plus className="w-4 h-4"/>Add Product</button>
      </div>
      <div className="relative max-w-xs"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D72638]/30 placeholder-gray-600"/></div>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading?<div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#D72638]"/></div>:(
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-800">{["Image","Name","Category","Price","Stock","Featured","Active","Actions"].map(h=><th key={h} className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody>
                {filtered.map(p=>(
                  <tr key={p.id} className={cn("border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors",deleting===p.id&&"opacity-40")}>
                    <td className="px-4 py-3"><div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-800">{p.images[0]?<Image src={cloudinaryUrl(p.images[0],100,100)} alt="" width={44} height={44} className="object-cover w-full h-full"/>:<div className="w-full h-full flex items-center justify-center text-lg">🎨</div>}</div></td>
                    <td className="px-4 py-3 max-w-[150px]"><p className="text-white font-medium text-xs line-clamp-2">{p.name}</p></td>
                    <td className="px-4 py-3"><span className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded-full whitespace-nowrap">{p.category}</span></td>
                    <td className="px-4 py-3 text-white font-semibold text-xs whitespace-nowrap">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3"><span className={cn("font-bold",sc(p.stock))}>{p.stock}</span></td>
                    <td className="px-4 py-3"><button onClick={()=>toggle(p.id,"featured",!p.featured)} className={cn("w-9 h-5 rounded-full transition-colors relative",p.featured?"bg-[#D72638]":"bg-gray-700")}><span className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow",p.featured?"right-0.5":"left-0.5")}/></button></td>
                    <td className="px-4 py-3"><button onClick={()=>toggle(p.id,"isActive",!p.isActive)} className={cn("w-9 h-5 rounded-full transition-colors relative",p.isActive?"bg-green-500":"bg-gray-700")}><span className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow",p.isActive?"right-0.5":"left-0.5")}/></button></td>
                    <td className="px-4 py-3"><div className="flex gap-1"><button onClick={()=>setModal({open:true,p})} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-700"><Pencil className="w-3.5 h-3.5"/></button><button onClick={()=>del(p)} disabled={deleting===p.id} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10">{deleting===p.id?<Loader2 className="w-3.5 h-3.5 animate-spin"/>:<Trash2 className="w-3.5 h-3.5"/>}</button></div></td>
                  </tr>
                ))}
                {filtered.length===0&&<tr><td colSpan={8} className="text-center py-12 text-gray-600">No products found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {modal.open&&<Modal product={modal.p} onClose={()=>setModal({open:false})} onSaved={load}/>}
    </div>
  );
}
