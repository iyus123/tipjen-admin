import AdminApp from "@/components/AdminApp";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const storeName = process.env.STORE_NAME || "Tipjen";
  const whatsappNumber = process.env.WHATSAPP_NUMBER || "083894403505";
  return <AdminApp storeName={storeName} whatsappNumber={whatsappNumber} />;
}
