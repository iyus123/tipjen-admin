"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { rupiah } from "@/lib/format";
import type { Product } from "@/lib/types";

type FormState = {
  name: string;
  price: string;
  stock: string;
  category: string;
  image: string;
  description: string;
  is_published: boolean;
};

const blankForm: FormState = {
  name: "",
  price: "",
  stock: "0",
  category: "",
  image: "",
  description: "",
  is_published: true,
};

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<FormState>(blankForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "Toko Saya";

  async function loadProducts() {
    const res = await fetch("/api/products?all=1", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setProducts(data.products || []);
  }

  useEffect(() => {
    const init = async () => {
      const res = await fetch("/api/admin/check", { cache: "no-store" });
      const data = await res.json();
      setIsLoggedIn(Boolean(data.authenticated));
      if (data.authenticated) {
        await loadProducts();
      }
      setLoading(false);
    };

    init();
  }, []);

  const filteredProducts = useMemo(() => {
    const keyword = search.toLowerCase();
    return products.filter((item) => {
      return (
        item.name.toLowerCase().includes(keyword) ||
        item.category.toLowerCase().includes(keyword) ||
        (item.description || "").toLowerCase().includes(keyword)
      );
    });
  }, [products, search]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Login gagal.");
      return;
    }

    setIsLoggedIn(true);
    setPassword("");
    await loadProducts();
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsLoggedIn(false);
    setProducts([]);
    setEditingId(null);
    setForm(blankForm);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      category: form.category.trim() || "Umum",
      image: form.image.trim() || null,
      description: form.description.trim() || null,
      is_published: form.is_published,
    };

    const method = editingId ? "PUT" : "POST";
    const body = editingId ? { id: editingId, ...payload } : payload;

    const res = await fetch("/api/products", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Gagal menyimpan produk.");
      setSaving(false);
      return;
    }

    setForm(blankForm);
    setEditingId(null);
    await loadProducts();
    setSaving(false);
  }

  function handleEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category,
      image: product.image || "",
      description: product.description || "",
      is_published: product.is_published,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      await loadProducts();
    }
  }

  async function handleToggle(product: Product) {
    const res = await fetch("/api/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        category: product.category,
        image: product.image,
        description: product.description,
        is_published: !product.is_published,
      }),
    });

    if (res.ok) {
      await loadProducts();
    }
  }

  if (loading) {
    return (
      <>
        <Header title={storeName} subtitle="Memuat halaman penjual..." current="admin" />
        <main className="page container">
          <div className="card empty">Sedang memuat...</div>
        </main>
      </>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <Header
          title={storeName}
          subtitle="Halaman penjual untuk tambah katalog dan atur produk"
          current="admin"
        />
        <main className="page container">
          <section className="card login-wrap stack">
            <div>
              <h2 className="title">Login Penjual</h2>
              <p className="small">Hanya penjual yang bisa menambah, mengedit, dan menghapus katalog.</p>
            </div>
            <form onSubmit={handleLogin} className="stack">
              <div>
                <label className="label">Password admin</label>
                <input
                  type="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password admin"
                />
              </div>
              {error ? <div className="error">{error}</div> : null}
              <button className="button" type="submit">Masuk</button>
              <div className="notice">
                Password default ada di file <b>.env</b>. Ganti sendiri agar lebih aman.
              </div>
            </form>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Header
        title={storeName}
        subtitle="Setiap update dari penjual akan ikut tampil di halaman pembeli"
        current="admin"
      />
      <main className="page container stack">
        <section className="grid-3">
          <div className="card">
            <div className="small">Total produk</div>
            <div className="price">{products.length}</div>
          </div>
          <div className="card">
            <div className="small">Produk tampil</div>
            <div className="price">{products.filter((item) => item.is_published).length}</div>
          </div>
          <div className="card">
            <div className="small">Masih draft</div>
            <div className="price">{products.filter((item) => !item.is_published).length}</div>
          </div>
        </section>

        <section className="grid-2">
          <div className="card stack">
            <div>
              <h2 className="title">{editingId ? "Edit Produk" : "Tambah Produk"}</h2>
              <p className="small">Produk yang aktif akan langsung muncul di halaman pembeli.</p>
            </div>

            <form onSubmit={handleSubmit} className="stack">
              <div>
                <label className="label">Nama produk</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>

              <div className="grid-2">
                <div>
                  <label className="label">Harga</label>
                  <input className="input" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Stok</label>
                  <input className="input" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="label">Kategori</label>
                <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>

              <div>
                <label className="label">Link gambar</label>
                <input className="input" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
              </div>

              <div>
                <label className="label">Deskripsi</label>
                <textarea className="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                />
                <div>
                  <div><b>Tampilkan di halaman pembeli</b></div>
                  <div className="small">Kalau dimatikan, produk tersimpan tapi tidak muncul di katalog pembeli.</div>
                </div>
              </label>

              {error ? <div className="error">{error}</div> : null}

              <div className="inline">
                <button className="button" type="submit" disabled={saving}>
                  {saving ? "Menyimpan..." : editingId ? "Simpan perubahan" : "Tambah produk"}
                </button>
                <button
                  className="button-secondary"
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(blankForm);
                    setError("");
                  }}
                >
                  Reset
                </button>
                <button className="button-danger" type="button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </form>
          </div>

          <div className="card stack">
            <div>
              <h2 className="title">Semua Produk</h2>
              <p className="small">Cari, edit, hapus, dan atur publish produk dari sini.</p>
            </div>

            <div>
              <label className="label">Cari produk</label>
              <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama atau kategori" />
            </div>

            <div className="stack">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div className="product-row" key={product.id}>
                    <img className="product-thumb" src={product.image || "https://placehold.co/200x200?text=Produk"} alt={product.name} />
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <div className="inline">
                        <b>{product.name}</b>
                        <span className={`badge ${product.is_published ? "badge-green" : "badge-amber"}`}>
                          {product.is_published ? "Tampil" : "Draft"}
                        </span>
                      </div>
                      <div className="small">{product.category}</div>
                      <div style={{ marginTop: 6 }}><b>{rupiah(product.price)}</b></div>
                    </div>
                    <div className="inline">
                      <button className="button-secondary" type="button" onClick={() => handleToggle(product)}>
                        {product.is_published ? "Sembunyikan" : "Tampilkan"}
                      </button>
                      <button className="button-secondary" type="button" onClick={() => handleEdit(product)}>
                        Edit
                      </button>
                      <button className="button-danger" type="button" onClick={() => handleDelete(product.id)}>
                        Hapus
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty">Belum ada produk.</div>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
