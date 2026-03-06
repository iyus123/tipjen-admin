import { Header } from "@/components/Header";
import { supabaseAdmin } from "@/lib/supabase";
import { rupiah } from "@/lib/format";
import type { Product } from "@/lib/types";

async function getProducts() {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    return [] as Product[];
  }

  return (data as Product[]) || [];
}

export default async function ShopPage() {
  const products = await getProducts();
  const storeName = process.env.STORE_NAME || "Toko Saya";
  const waNumber = process.env.STORE_WHATSAPP || "6281234567890";

  return (
    <>
      <Header
        title={storeName}
        subtitle="Pembeli hanya melihat produk yang sudah dipajang penjual"
        current="shop"
      />

      <main className="page container stack">
        <section className="card">
          <h2 className="title">Katalog Pembeli</h2>
          <p className="small">
            Setiap produk yang di-publish dari halaman penjual akan otomatis tampil di sini.
          </p>
        </section>

        <section className="product-grid">
          {products.length > 0 ? (
            products.map((product) => {
              const message = encodeURIComponent(
                `Halo, saya mau pesan:\n\nProduk: ${product.name}\nHarga: ${rupiah(product.price)}\nStok tersedia: ${product.stock}\n\nTolong info cara order ya.`
              );

              return (
                <article key={product.id} className="product-card">
                  <img
                    src={product.image || "https://placehold.co/600x400?text=Produk"}
                    alt={product.name}
                    className="product-image"
                  />
                  <div className="product-content stack">
                    <div className="inline" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <span className="badge">{product.category || "Umum"}</span>
                        <div className="spacer" />
                        <h3 className="title">{product.name}</h3>
                      </div>
                      <span className="small">Stok {product.stock}</span>
                    </div>

                    <p className="small">{product.description || "Produk tersedia dan siap dipesan."}</p>

                    <div className="inline" style={{ justifyContent: "space-between" }}>
                      <div>
                        <div className="small">Harga</div>
                        <div className="price">{rupiah(product.price)}</div>
                      </div>
                      <a
                        href={`https://wa.me/${waNumber}?text=${message}`}
                        target="_blank"
                        rel="noreferrer"
                        className="button"
                      >
                        Beli via WhatsApp
                      </a>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="card empty" style={{ gridColumn: "1 / -1" }}>
              Belum ada produk yang dipajang.
            </div>
          )}
        </section>
      </main>
    </>
  );
}
