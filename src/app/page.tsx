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

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-100 lg:bg-neutral-200">
      <h1 className="sr-only">
        TradeHub — Alibaba-style B2B wholesale marketplace with flash deals,
        verified suppliers, and a request-for-quote engine.
      </h1>

      <div className="flex justify-center items-start py-0 lg:py-8">
        <div
          className="
            w-full max-w-[420px]
            bg-[#fafaf8]
            min-h-screen lg:min-h-0
            lg:rounded-[44px] lg:border-[9px] lg:border-neutral-900
            lg:overflow-hidden lg:relative
            lg:shadow-[0_32px_80px_rgba(0,0,0,0.35)]
          "
        >
          <header className="sticky top-0 z-30">
            <MobileTopBar />
          </header>

          <div className="bg-[#f2f0ec] pb-2">
            <HeroBanner />
            <FlashDealsBar />
            <FlashDealsScroll />

            <div className="h-2 bg-[#e8e5e0] mt-2.5" />
            <CategoryGrid />

            <div className="h-2 bg-[#e8e5e0] mt-2.5" />
            <TrendingProducts />

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
  );
}
