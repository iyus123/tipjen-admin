"use client";

import { Eye, EyeOff, Moon, Pencil, Plus, Save, Search, Sun, Trash2, Upload, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Product, ProductPayload } from '@/lib/types';
import { cn, formatRupiah } from '@/lib/utils';

const blankForm: ProductPayload = {
  name: '',
  description: '',
  category: '',
  price: 0,
  stock: 0,
  image_url: '',
  is_published: true,
  tags: [],
};

export default function AdminDashboard() {
  const [dark, setDark] = useState(false);
  const [password, setPassword] = useState('');
  const [isAuthed, setIsAuthed] = useState(false);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductPayload>(blankForm);
  const [storedTags, setStoredTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Tipjen';
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'admin123';

  useEffect(() => {
    const savedTheme = localStorage.getItem('tipjen-admin-theme');
    if (savedTheme === 'dark') {
      setDark(true);
      document.body.classList.add('dark');
    }
    const savedTags = localStorage.getItem('tipjen-admin-tags');
    if (savedTags) setStoredTags(JSON.parse(savedTags));
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark', dark);
    localStorage.setItem('tipjen-admin-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    localStorage.setItem('tipjen-admin-tags', JSON.stringify(storedTags));
  }, [storedTags]);

  useEffect(() => {
    if (!isAuthed) return;
    void loadProducts();
  }, [isAuthed]);

  const filteredProducts = useMemo(() => {
    return products.filter((item) =>
      [item.name, item.category ?? '', item.description ?? '', ...(item.tags ?? [])]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [products, search]);

  async function loadProducts() {
    const res = await fetch('/api/products', { cache: 'no-store' });
    const data = (await res.json()) as Product[] | { error: string };
    if (!res.ok || !Array.isArray(data)) {
      setMessage('Gagal memuat produk');
      return;
    }
    setProducts(data);
  }

  function notify(text: string) {
    setMessage(text);
    window.clearTimeout((notify as unknown as { timer?: number }).timer);
    (notify as unknown as { timer?: number }).timer = window.setTimeout(() => setMessage(''), 1800);
  }

  function handleLogin() {
    if (password === adminPassword) {
      setIsAuthed(true);
      notify('Berhasil masuk ke dashboard admin');
      return;
    }
    notify('Password admin salah');
  }

  function resetForm() {
    setForm(blankForm);
    setEditingId(null);
    setTagInput('');
  }

  function addTag(tag: string) {
    const clean = tag.trim();
    if (!clean) return;
    if (!storedTags.includes(clean)) setStoredTags((prev) => [...prev, clean]);
    if (!form.tags.includes(clean)) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, clean] }));
    }
  }

  function removeTag(tag: string) {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((item) => item !== tag) }));
  }

  async function handleSubmit() {
    const payload = {
      ...form,
      price: Number(form.price || 0),
      stock: Number(form.stock || 0),
      category: form.category.trim(),
      description: form.description.trim(),
      image_url: form.image_url,
      tags: form.tags,
    };

    const url = editingId ? `/api/products/${editingId}` : '/api/products';
    const method = editingId ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      notify('Gagal menyimpan produk');
      return;
    }

    await loadProducts();
    notify(editingId ? 'Produk berhasil diperbarui' : 'Produk berhasil ditambahkan');
    resetForm();
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description ?? '',
      category: product.category ?? '',
      price: Number(product.price),
      stock: Number(product.stock),
      image_url: product.image_url ?? '',
      is_published: product.is_published ?? false,
      tags: product.tags ?? [],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteProduct(id: string) {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      notify('Gagal menghapus produk');
      return;
    }
    await loadProducts();
    notify('Produk berhasil dihapus');
  }

  async function toggleProduct(id: string, nextValue: boolean) {
    const res = await fetch(`/api/products/${id}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: nextValue }),
    });
    if (!res.ok) {
      notify('Gagal mengubah status produk');
      return;
    }
    await loadProducts();
    notify(nextValue ? 'Produk ditampilkan di buyer' : 'Produk disembunyikan dari buyer');
  }

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, image_url: String(reader.result || '') }));
    };
    reader.readAsDataURL(file);
  }

  const shell = dark ? 'bg-[#020817] text-white' : 'bg-[#f8f2ec] text-[#4a342b]';
  const card = dark ? 'border-white/10 bg-white/5' : 'border-[#ead9cc] bg-white';
  const input = dark ? 'border-white/10 bg-white/5 text-white' : 'border-[#ead9cc] bg-[#fffaf6] text-[#4a342b]';
  const soft = dark ? 'text-slate-300' : 'text-[#84685c]';

  if (!isAuthed) {
    return (
      <div className={cn('min-h-screen px-6 py-10', shell)}>
        <div className={cn('mx-auto max-w-md rounded-[30px] border p-6', card)}>
          <h1 className="text-3xl font-bold">{storeName} Admin</h1>
          <p className={cn('mt-2 text-sm', soft)}>Masuk untuk mengelola katalog, tag, dan status tayang produk.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan password admin"
            className={cn('mt-5 w-full rounded-2xl border px-4 py-3 outline-none', input)}
          />
          <div className="mt-4 flex gap-3">
            <button onClick={handleLogin} className="rounded-2xl bg-[#4f342b] px-5 py-3 font-semibold text-white">
              Masuk
            </button>
            <button onClick={() => setDark((v) => !v)} className={cn('rounded-2xl border px-5 py-3 font-semibold', input)}>
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
          {message && <p className="mt-4 text-sm text-amber-600">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen px-6 py-8', shell)}>
      {message && (
        <div className={cn('fixed right-6 top-6 z-50 rounded-2xl border px-4 py-3 text-sm shadow-xl', dark ? 'border-emerald-400/20 bg-emerald-400/20 text-emerald-200' : 'border-emerald-200 bg-white text-emerald-700')}>
          {message}
        </div>
      )}

      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className={cn('text-sm font-medium', soft)}>Tipjen Admin</p>
            <h1 className="mt-1 text-3xl font-bold">Kelola produk dengan mudah</h1>
          </div>
          <button onClick={() => setDark((v) => !v)} className={cn('rounded-2xl border px-4 py-3 font-medium', input)}>
            {dark ? 'Mode terang' : 'Mode gelap'}
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr,1.4fr]">
          <section className={cn('rounded-[28px] border p-5', card)}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">{editingId ? 'Edit produk' : 'Tambah produk'}</h2>
                <p className={cn('mt-1 text-sm', soft)}>Form ini sinkron langsung ke web buyer.</p>
              </div>
              {editingId && (
                <button onClick={resetForm} className={cn('rounded-2xl border px-4 py-2 text-sm', input)}>
                  Reset
                </button>
              )}
            </div>

            <div className="space-y-4">
              <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Nama produk" className={cn('w-full rounded-2xl border px-4 py-3 outline-none', input)} />
              <div className="grid grid-cols-2 gap-4">
                <input value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} placeholder="Kategori" className={cn('w-full rounded-2xl border px-4 py-3 outline-none', input)} />
                <input value={String(form.stock)} onChange={(e) => setForm((prev) => ({ ...prev, stock: Number(e.target.value || 0) }))} placeholder="Stok" type="number" className={cn('w-full rounded-2xl border px-4 py-3 outline-none', input)} />
              </div>
              <input value={String(form.price)} onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value || 0) }))} placeholder="Harga" type="number" className={cn('w-full rounded-2xl border px-4 py-3 outline-none', input)} />
              <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Deskripsi" className={cn('min-h-[100px] w-full rounded-2xl border px-4 py-3 outline-none', input)} />

              <div className={cn('rounded-[24px] border border-dashed p-5', input)}>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#4f342b] px-4 py-3 font-semibold text-white">
                  <Upload className="h-4 w-4" /> Upload gambar dari galeri
                  <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                </label>
                {form.image_url && <img src={form.image_url} alt="preview" className="mt-4 h-40 w-40 rounded-2xl object-cover" />}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium">Label / tag</p>
                  <p className={cn('text-xs', soft)}>Klik tag tersimpan atau buat tag baru</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {storedTags.map((tag) => (
                    <button key={tag} type="button" onClick={() => addTag(tag)} className={cn('rounded-full border px-3 py-2 text-xs font-medium', input)}>
                      {tag}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Ketik label baru..." className={cn('flex-1 rounded-2xl border px-4 py-3 outline-none', input)} />
                  <button onClick={() => { addTag(tagInput); setTagInput(''); }} className="rounded-2xl bg-[#4f342b] px-4 py-3 font-semibold text-white">
                    Simpan label
                  </button>
                </div>
                {form.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.tags.map((tag) => (
                      <button key={tag} type="button" onClick={() => removeTag(tag)} className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium', input)}>
                        #{tag} <X className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <label className="inline-flex items-center gap-3">
                <input type="checkbox" checked={form.is_published} onChange={(e) => setForm((prev) => ({ ...prev, is_published: e.target.checked }))} />
                <span className="text-sm">Tampilkan di web buyer</span>
              </label>

              <div className="flex gap-3">
                <button onClick={handleSubmit} className="inline-flex items-center gap-2 rounded-2xl bg-[#4f342b] px-5 py-3 font-semibold text-white">
                  <Save className="h-4 w-4" /> {editingId ? 'Simpan perubahan' : 'Tambah produk'}
                </button>
                <button onClick={resetForm} className={cn('rounded-2xl border px-5 py-3 font-semibold', input)}>
                  Kosongkan
                </button>
              </div>
            </div>
          </section>

          <section className={cn('rounded-[28px] border p-5', card)}>
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-bold">Daftar produk</h2>
                <p className={cn('mt-1 text-sm', soft)}>Edit, hapus, dan ubah status tayang dengan cepat.</p>
              </div>
              <div className="relative w-full lg:w-80">
                <Search className={cn('absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2', soft)} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari produk..." className={cn('w-full rounded-2xl border py-3 pl-11 pr-4 outline-none', input)} />
              </div>
            </div>

            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className={cn('flex flex-col gap-4 rounded-[24px] border p-4 lg:flex-row lg:items-center', dark ? 'border-white/10 bg-white/5' : 'border-[#efe0d5] bg-[#fffaf6]')}>
                  <img src={product.image_url || 'https://placehold.co/160x160?text=Tipjen'} alt={product.name} className="h-24 w-24 rounded-[20px] object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-lg font-bold">{product.name}</h3>
                      <span className={cn('rounded-full px-3 py-1 text-xs font-medium', product.is_published ? (dark ? 'bg-emerald-400/15 text-emerald-300' : 'bg-emerald-100 text-emerald-700') : dark ? 'bg-amber-400/15 text-amber-300' : 'bg-amber-100 text-amber-700')}>
                        {product.is_published ? 'Tayang di buyer' : 'Disembunyikan'}
                      </span>
                    </div>
                    <p className={cn('mt-1 text-sm', soft)}>{product.category || 'Lainnya'} • Stok {product.stock}</p>
                    {product.tags?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {product.tags.map((tag) => (
                          <span key={tag} className={cn('rounded-full px-3 py-1 text-xs font-medium', dark ? 'bg-white/10 text-slate-200' : 'bg-[#f4e8df] text-[#7d5f52]')}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="mt-2 font-semibold">{formatRupiah(Number(product.price))}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => toggleProduct(product.id, !product.is_published)} className={cn('inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium', dark ? 'bg-white text-slate-900' : 'bg-[#4f342b] text-white')}>
                      {product.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {product.is_published ? 'Sembunyikan' : 'Tampilkan'}
                    </button>
                    <button onClick={() => startEdit(product)} className={cn('inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium', input)}>
                      <Pencil className="h-4 w-4" /> Edit
                    </button>
                    <button onClick={() => deleteProduct(product.id)} className={cn('inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium', dark ? 'border-red-400/20 bg-red-400/10 text-red-300' : 'border-red-200 bg-red-50 text-red-600')}>
                      <Trash2 className="h-4 w-4" /> Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
