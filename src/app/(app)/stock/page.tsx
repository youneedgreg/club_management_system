import { StockManager } from "@/components/stock/stock-manager";
import { getActiveClubId } from "@/server/active-club";
import { listProducts, listSuppliers } from "@/server/services";

/** Bar Stock / Inventory — live, session-scoped catalogue with management. */
export default async function StockPage() {
  const clubId = await getActiveClubId();
  const [products, suppliers] = await Promise.all([listProducts(clubId), listSuppliers(clubId)]);

  return <StockManager products={products} suppliers={suppliers} />;
}
