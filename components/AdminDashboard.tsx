"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  BadgePlus,
  Eye,
  EyeOff,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  PencilLine,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { Product } from "@/lib/types";

const formatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

type FormState = {
  id?: string;
  name: string;
  category: string;
  description: string;
  price: string;
  stock: string;
  image_url: string;
  published: boolean;
};

const blankForm: FormState = {
  name: "",
  category: "",
  description: "",
  price: "",
  stock: "",
  image_url: "",
  published: true,
};

export default function AdminDashboard({ storeName, whatsappNumber }: { storeName: string; whatsappNumber: string }) {
  const [isChecking, setIsChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"dashboard" | "manage">("dashboard");
  const [form, setForm] = useState<FormState>(blankForm);
  const [submitState, setSubmitState] = useState<"idle" | "saving">("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const response = await fetch("/api/admin/check", { cache: "no-store" });
      const data = await response.json();
      setAuthenticated(Boolean(data.authenticated));
      if (data.authenticated) {
        await loadProducts();
      }
    } finally {
      setIsChecking(false);
    }
  }

  async function loadProducts() {
    const response = await fetch("/api/products", { cache: "no-store" });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Gagal memuat produk.");
      return;
    }

    setProducts(data.products || []);
  }

  const filteredProducts = useMemo(() => {
    const keyword = search.toLowerCase();
    return products.filter((product) =>
      [product.name, product.category || "", product.description || ""]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [products, search]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (!response.ok) {
      setLoginError(data.error || "Login gagal.");
      return;
    }

    setAuthenticated(true);
    setPassword("");
    await loadProducts();
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setProducts([]);
    setForm(blankForm);
    setMessage("");
    setError("");
  }

  function fillForm(product: Product) {
    setForm({
      id: product.id,
      name: product.name,
      category: product.category || "",
      description: product.description || "",
      price: String(product.price),
      stock: String(product.stock),
      image_url: product.image_url || "",
      published: product.published,
    });
    setTab("manage");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm(blankForm);
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, image_url: String(reader.result || "") }));
      setError("");
      setMessage("Gambar dari galeri berhasil dimuat.");
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("saving");
    setMessage("");
    setError("");

    const payload = {
      id: form.id,
      name: form.name.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      price: Number(form.price || 0),
      stock: Number(form.stock || 0),
      image_url: form.image_url,
      published: form.published,
    };

    const response = await fetch("/api/products", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      setSubmitState("idle");
      setError(data.error || "Gagal menyimpan produk.");
      return;
    }

    setSubmitState("idle");
    setMessage(form.id ? "Produk berhasil diperbarui." : "Produk baru berhasil ditambahkan.");
    resetForm();
    await loadProducts();
    setTab("dashboard");
  }

  async function togglePublish(product: Product) {
    setError("");
    setMessage("");

    const response = await fetch("/api/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: product.id,
        name: product.name,
        category: product.category || "",
        description: product.description || "",
        price: product.price,
        stock: product.stock,
        image_url: product.image_url || "",
        published: !product.published,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Gagal mengubah status produk.");
      return;
    }

    setMessage(product.published ? "Produk disembunyikan dari buyer." : "Produk ditampilkan ke buyer.");
    await loadProducts();
  }

  async function removeProduct(id: string) {
    const confirmed = window.confirm("Yakin ingin menghapus produk ini?");
    if (!confirmed) return;

    const response = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Gagal menghapus produk.");
      return;
    }

    setMessage("Produk berhasil dihapus.");
    await loadProducts();
  }

  if (isChecking) {
    return <div className="login-wrap"><div className="card" style={{ padding: 28 }}>Memuat dashboard admin...</div></div>;
  }

  if (!authenticated) {
    return (
      <div className="login-wrap">
        <div className="card" style={{ width: "100%", maxWidth: 520, padding: 28 }}>
          <div className="stack-lg">
            <div className="stack-sm">
              <span className="badge"><ShieldCheck size={16} /> Area khusus penjual</span>
              <h1 className="title-lg">Admin {storeName}</h1>
              <p className="muted">Masuk ke dashboard cozy untuk mengatur katalog, harga, stok, status tayang, dan upload gambar langsung dari galeri.</p>
            </div>

            <form onSubmit={handleLogin} className="stack-md">
              <div className="field">
                <label className="label">Password admin</label>
                <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan password" required />
              </div>

              {loginError ? <div className="alert">{loginError}</div> : null}

              <button className="btn btn-primary" type="submit">Masuk ke Dashboard</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shell stack-lg">
      <section className="hero" style={{ padding: 28 }}>
        <div className="row-between wrap">
          <div className="stack-sm" style={{ maxWidth: 760 }}>
            <span className="badge soft"><Sparkles size={16} /> Dashboard nyaman dan kekinian</span>
            <h1 className="title-xl">Kelola katalog {storeName} dengan lebih rapi, cozy, dan cepat.</h1>
            <p className="muted">Semua produk yang Anda publish di sini akan langsung tersinkron ke web buyer. Nomor WhatsApp aktif: <b>{whatsappNumber}</b>.</p>
          </div>

          <div className="stack-sm" style={{ alignItems: "flex-end" }}>
            <div className="pill-nav">
              <button className={`btn ${tab === "dashboard" ? "btn-primary" : "btn-soft"}`} onClick={() => setTab("dashboard")}><LayoutDashboard size={16} /> Dashboard</button>
              <button className={`btn ${tab === "manage" ? "btn-primary" : "btn-soft"}`} onClick={() => setTab("manage")}><BadgePlus size={16} /> Kelola Produk</button>
            </div>
            <button className="btn btn-danger" onClick={handleLogout}><LogOut size={16} /> Keluar</button>
          </div>
        </div>
      </section>

      {message ? <div className="notice">{message}</div> : null}
      {error ? <div className="alert">{error}</div> : null}

      {tab === "dashboard" ? (
        <>
          <section className="stats">
            <div className="stat"><span className="muted">Total produk</span><b>{products.length}</b></div>
            <div className="stat"><span className="muted">Sedang tayang</span><b>{products.filter((item) => item.published).length}</b></div>
            <div className="stat"><span className="muted">Masih draft</span><b>{products.filter((item) => !item.published).length}</b></div>
          </section>

          <section className="panel" style={{ padding: 24 }}>
            <div className="row-between wrap" style={{ marginBottom: 18 }}>
              <div className="stack-sm">
                <h2 className="title-lg">Semua produk</h2>
                <p className="muted">Klik edit untuk memperbarui detail. Gunakan tampilkan/sembunyikan untuk mengatur visibilitas di web buyer.</p>
              </div>
              <div style={{ minWidth: 280, flex: 1, maxWidth: 380, position: "relative" }}>
                <Search size={18} style={{ position: "absolute", top: 15, left: 14, color: "#7c685d" }} />
                <input className="input" style={{ paddingLeft: 40 }} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama, kategori, deskripsi..." />
              </div>
            </div>

            <div className="table-list">
              {filteredProducts.length === 0 ? (
                <div className="empty">Belum ada produk. Tambahkan produk pertama Anda dari tab Kelola Produk.</div>
              ) : (
                filteredProducts.map((product) => (
                  <div className="product-item" key={product.id}>
                    <img className="product-thumb" src={product.image_url || "https://placehold.co/300x300/f0e3d8/8f5a40?text=Tipjen"} alt={product.name} />
                    <div className="product-meta">
                      <div className="row wrap">
                        <h3 className="title-md">{product.name}</h3>
                        <span className={`badge ${product.published ? "green" : ""}`}>{product.published ? "Tampil di buyer" : "Disembunyikan"}</span>
                        {product.category ? <span className="badge soft">{product.category}</span> : null}
                      </div>
                      <p className="muted">{product.description || "Belum ada deskripsi produk."}</p>
                      <div className="row wrap">
                        <span className="price">{formatter.format(product.price)}</span>
                        <span className="muted">Stok: {product.stock}</span>
                      </div>
                    </div>
                    <div className="stack-sm">
                      <button className="btn btn-soft" onClick={() => fillForm(product)}><PencilLine size={16} /> Edit</button>
                      <button className="btn btn-soft" onClick={() => togglePublish(product)}>{product.published ? <EyeOff size={16} /> : <Eye size={16} />}{product.published ? "Sembunyikan" : "Tampilkan"}</button>
                      <button className="btn btn-danger" onClick={() => removeProduct(product.id)}><Trash2 size={16} /> Hapus</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      ) : (
        <section className="grid grid-2">
          <div className="panel" style={{ padding: 24 }}>
            <div className="stack-md">
              <div className="stack-sm">
                <span className="badge"><BadgePlus size={16} /> Form produk</span>
                <h2 className="title-lg">{form.id ? "Edit produk" : "Tambah produk baru"}</h2>
                <p className="muted">Tambahkan informasi lengkap lalu pilih apakah produk langsung tampil di buyer atau disimpan sebagai draft.</p>
              </div>

              <form className="stack-md" onSubmit={handleSubmit}>
                <div className="field">
                  <label className="label">Nama produk</label>
                  <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Contoh: Basic Knit Cardigan" required />
                </div>

                <div className="grid grid-2">
                  <div className="field">
                    <label className="label">Kategori</label>
                    <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Fashion, Aksesoris, dll" />
                  </div>
                  <div className="field">
                    <label className="label">Stok</label>
                    <input className="input" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" min={0} />
                  </div>
                </div>

                <div className="grid grid-2">
                  <div className="field">
                    <label className="label">Harga</label>
                    <input className="input" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="75000" min={0} required />
                  </div>
                  <div className="field">
                    <label className="label">Status tayang</label>
                    <select className="select" value={form.published ? "published" : "draft"} onChange={(e) => setForm({ ...form, published: e.target.value === "published" })}>
                      <option value="published">Tampilkan di buyer</option>
                      <option value="draft">Simpan sebagai draft</option>
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label className="label">Deskripsi</label>
                  <textarea className="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tulis detail produk, bahan, ukuran, atau keunggulan produk di sini..." />
                </div>

                <div className="upload-box">
                  <ImagePlus size={34} />
                  <div className="stack-sm" style={{ textAlign: "center" }}>
                    <b>Upload gambar dari galeri</b>
                    <span className="muted">Pilih foto dari perangkat. Sistem akan menyimpan dan menampilkan preview otomatis.</span>
                  </div>
                  <label className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <Upload size={16} /> Pilih Gambar
                    <input hidden type="file" accept="image/*" onChange={handleImageUpload} />
                  </label>
                  <span className="muted">Atau tempel manual lewat link/data URL di bawah ini bila diperlukan.</span>
                  <input className="input" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Link gambar atau hasil upload akan muncul di sini" />
                </div>

                <div className="row wrap">
                  <button className="btn btn-primary" type="submit" disabled={submitState === "saving"}>{submitState === "saving" ? "Menyimpan..." : form.id ? "Simpan perubahan" : "Tambah produk"}</button>
                  <button className="btn btn-soft" type="button" onClick={resetForm}>Reset form</button>
                </div>
              </form>
            </div>
          </div>

          <div className="panel" style={{ padding: 24 }}>
            <div className="stack-md">
              <div className="stack-sm">
                <span className="badge soft">Preview instan</span>
                <h2 className="title-lg">Tampilan produk</h2>
                <p className="muted">Preview ini membantu Anda mengecek hasil akhir sebelum dipublikasikan ke web buyer.</p>
              </div>

              <div className="card" style={{ padding: 18 }}>
                <img className="preview" src={form.image_url || "https://placehold.co/800x600/f4e3d6/8f5a40?text=Preview+Tipjen"} alt="Preview produk" />
                <div className="stack-sm" style={{ marginTop: 16 }}>
                  <div className="row wrap">
                    <span className="badge soft">{form.category || "Kategori"}</span>
                    <span className={`badge ${form.published ? "green" : ""}`}>{form.published ? "Akan tampil di buyer" : "Masih draft"}</span>
                  </div>
                  <h3 className="title-md">{form.name || "Nama produk akan tampil di sini"}</h3>
                  <div className="price">{formatter.format(Number(form.price || 0))}</div>
                  <p className="muted">{form.description || "Deskripsi produk akan tampil di area ini agar Anda bisa mengecek tampilan sebelum publish."}</p>
                  <div className="separator" />
                  <p className="muted">Stok: {form.stock || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
