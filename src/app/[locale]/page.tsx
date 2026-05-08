export const revalidate = 60;

import MobileTopBar from "@/components/landing/MobileTopBar";
import HeroBanner from "@/components/landing/HeroBanner";
import FlashDealsBar from "@/components/landing/FlashDealsBar";
import FlashDealsScroll from "@/components/landing/FlashDealsScroll";
import CategoryGrid from "@/components/landing/CategoryGrid";
import TrendingProducts from "@/components/landing/TrendingProducts";
import PromoGrid from "@/components/landing/PromoGrid";
import SuppliersScroll from "@/components/landing/SuppliersScroll";
import RFQForm from "@/components/landing/RFQForm";
import RecentOrders from "@/components/landing/RecentOrders";
import BottomNav from "@/components/landing/BottomNav";
import DesktopHeader from "@/components/landing/DesktopHeader";
import DesktopHero from "@/components/landing/DesktopHero";
import DesktopProducts from "@/components/landing/DesktopProducts";
import DesktopFooter from "@/components/landing/DesktopFooter";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient();
  const [categoriesRes, productsRes, flashRes] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug, icon, thumbnail_url, is_active, parent_id")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("products")
      .select("id, slug, name, category, base_price, moq, image_url, is_flash_deal, flash_discount_pct, profiles!supplier_id(full_name, company_name)")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("products")
      .select("id, slug, name, category, base_price, moq, image_url, is_flash_deal, flash_discount_pct, profiles!supplier_id(full_name, company_name)")
      .eq("is_flash_deal", true)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);
  const categories = categoriesRes.data ?? [];
  const products = (productsRes.data ?? []) as any[];
  const flashDeals = (flashRes.data ?? []) as any[];
  return (
    <>
      {/* MOBILE LAYOUT */}
      <main className="min-h-screen bg-neutral-100 lg:hidden">
        <h1 className="sr-only">
          TradeHub — B2B wholesale marketplace with flash deals, verified suppliers, and RFQ engine.
        </h1>
        <div className="flex justify-center items-start py-0">
          <div className="w-full max-w-[420px] bg-[#fafaf8] min-h-screen">
            <header className="sticky top-0 z-30">
              <MobileTopBar />
            </header>
            <div className="bg-[#f2f0ec] pb-2">
              <HeroBanner />
              <FlashDealsBar />
              <FlashDealsScroll deals={flashDeals} locale={locale} />
              <div className="h-2 bg-[#e8e5e0] mt-2.5" />
              <CategoryGrid categories={categories ?? []} />
              <div className="h-2 bg-[#e8e5e0] mt-2.5" />
              <TrendingProducts products={products} locale={locale} />
              <div className="h-2 bg-[#e8e5e0] mt-2.5" />
              <PromoGrid />
              <div className="h-2 bg-[#e8e5e0] mt-2.5" />
              <SuppliersScroll />
              <div className="h-2 bg-[#e8e5e0] mt-2.5" />
              <RFQForm />
              <div className="h-2 bg-[#e8e5e0] mt-2.5" />
              <RecentOrders />
            </div>
            <div className="sticky bottom-0 z-30">
              <BottomNav />
            </div>
          </div>
        </div>
      </main>

      {/* DESKTOP LAYOUT */}
      <div className="hidden lg:block min-h-screen bg-neutral-100">
        <h1 className="sr-only">
          TradeHub — B2B wholesale marketplace with flash deals, verified suppliers, and RFQ engine.
        </h1>
        <DesktopHeader categories={categories} />
        <DesktopHero categories={categories} />
        <DesktopProducts trending={products} flashDeals={flashDeals} />
        <DesktopFooter />
      </div>
    </>
  );
}
