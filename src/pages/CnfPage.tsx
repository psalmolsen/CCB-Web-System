import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, ChevronDown, ChevronRight, Minus, X } from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import {
  getCnfTabsFn,
  getCnfItemsFn,
  cnfStockInFn,
  cnfStockOutFn,
} from "../lib/cnf-server-functions";
import type { CnfItem } from "../lib/cnf-types";

type Modal = { kind: "in" | "out"; item: CnfItem } | null;

type CategoryGroup = { category: string; items: CnfItem[] };

const RANGE_OPTIONS = ["All", "Weekly", "Monthly", "Quarterly", "Yearly"] as const;

function CnfKpi({
  label,
  value,
  unit,
  variant,
}: {
  label: string;
  value: string;
  unit?: string;
  variant: "blue" | "blue2" | "blue3" | "navy";
}) {
  const styles = {
    blue: "bg-[#2E3EA8] text-white",
    blue2: "bg-[#202D78] text-white",
    blue3: "bg-[#273690] text-white",
    navy: "bg-[#1A2560] text-white",
  }[variant];

  return (
    <div className={`rounded-2xl p-5 shadow-sm ${styles}`}>
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">{label}</div>
      <div className="mt-4 flex items-center gap-2">
        <div className="text-[32px] font-extrabold leading-none">{value}</div>
        {unit && (
          <div className="text-[12px] font-semibold uppercase tracking-widest text-white/80">{unit}</div>
        )}
      </div>
    </div>
  );
}

function StockModal({ mode, item, loading, onClose, onSave }: {
  mode: "in" | "out";
  item: CnfItem;
  loading: boolean;
  onClose: () => void;
  onSave: (qty: number) => void;
}) {
  const [qty, setQty] = useState(1);
  const isIn = mode === "in";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ccb-navy/50 p-6 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className={`border-b-[3px] px-6 pb-5 pt-6 ${isIn ? "border-ccb-blue" : "border-ccb-red"}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-ccb-muted">{isIn ? "Stock-In" : "Stock-Out"}</p>
              <h2 className="mt-1 text-lg font-bold text-ccb-navy">{isIn ? "Add Received Qty" : "Issue Stock"}</h2>
              <p className="mt-1 text-xs text-ccb-muted">{item.brand} — {item.category} {item.variant}</p>
            </div>
            <button onClick={onClose} className="rounded-full p-2 text-ccb-muted hover:bg-ccb-canvas">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              disabled={loading}
              className="h-12 w-12 rounded-full border border-ccb-border text-ccb-navy hover:border-ccb-blue disabled:opacity-50"
            >
              <Minus size={18} className="mx-auto" />
            </button>
            <input
              type="number"
              value={qty}
              min={1}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              className="w-32 rounded-2xl border border-ccb-border py-3 text-center text-[28px] font-extrabold text-ccb-navy outline-none focus:border-ccb-blue"
            />
            <button
              onClick={() => setQty(qty + 1)}
              disabled={loading}
              className="h-12 w-12 rounded-full border border-ccb-border text-ccb-navy hover:border-ccb-blue disabled:opacity-50"
            >
              <Plus size={18} className="mx-auto" />
            </button>
          </div>
          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="w-full rounded-2xl border border-ccb-border bg-ccb-canvas px-4 py-3 text-sm font-semibold text-ccb-navy transition hover:border-ccb-navy"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(qty)}
              disabled={loading}
              className="w-full rounded-2xl bg-ccb-blue px-4 py-3 text-sm font-semibold text-white transition hover:bg-ccb-blue/90 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategorySection({
  category,
  items,
  selectedItemId,
  onSelect,
  onStockIn,
  onStockOut,
}: {
  category: string;
  items: CnfItem[];
  selectedItemId: string;
  onSelect: (id: string) => void;
  onStockIn: (item: CnfItem) => void;
  onStockOut: (item: CnfItem) => void;
}) {
  const totalBalance = items.reduce((sum, item) => sum + item.currentBalance, 0);

  return (
    <div className="rounded-3xl border border-ccb-border bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-ccb-border bg-ccb-canvas px-5 py-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ccb-muted">{category}</div>
          <div className="text-sm font-bold text-ccb-navy mt-1">{items.length} {items.length === 1 ? "variant" : "variants"}</div>
        </div>
        <span className="rounded-full bg-ccb-navy/10 px-3 py-1 text-[10px] font-bold text-ccb-navy">
          {totalBalance.toLocaleString()} balance
        </span>
      </div>
      <div className="divide-y divide-ccb-border">
        {items.map((item, index) => {
          const id = `${item.tabName}-${item.rowNumber}`;
          const isActive = selectedItemId === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className={`w-full text-left ${isActive ? "bg-[#FFF8D6] border-ccb-gold shadow-[0_4px_0_rgba(233,181,45,0.5),0_12px_32px_-10px_rgba(26,37,96,0.3)]" : index % 2 === 1 ? "bg-ccb-canvas/30" : "bg-white hover:bg-[#FFFBEA]"} flex items-center justify-between gap-4 px-4 py-3 border-b border-ccb-border transition-all`}
            >
              <div>
                <p className="text-sm font-bold text-ccb-navy">{item.variant}</p>
                <p className="text-[11px] text-ccb-muted mt-1">Balance: {item.currentBalance.toLocaleString()} {item.uom}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onStockIn(item); }}
                  className="rounded-full border border-ccb-border bg-ccb-canvas px-3 py-1 text-[11px] font-semibold text-ccb-navy hover:border-ccb-blue hover:text-ccb-blue"
                >
                  Stock In +
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onStockOut(item); }}
                  className="rounded-full border border-ccb-border bg-ccb-canvas px-3 py-1 text-[11px] font-semibold text-ccb-navy hover:border-ccb-red hover:text-ccb-red"
                >
                  Stock Out −
                </button>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CnfCategoryGrid({
  categories,
  selectedItemId,
  onSelect,
  onStockIn,
  onStockOut,
}: {
  categories: CategoryGroup[];
  selectedItemId: string;
  onSelect: (id: string) => void;
  onStockIn: (item: CnfItem) => void;
  onStockOut: (item: CnfItem) => void;
}) {
  const nameplate = categories.find((group) => group.category === "NAME PLATE");
  const collar = categories.find((group) => group.category === "COLLAR");
  const footring = categories.find((group) => group.category === "FOOT RING");

  return (
    <div className="space-y-4">
      <CategoryPanel
        category="NAME PLATE"
        items={nameplate?.items ?? []}
        selectedItemId={selectedItemId}
        onSelect={onSelect}
        onStockIn={onStockIn}
        onStockOut={onStockOut}
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <CategoryPanel
          category="COLLAR"
          items={collar?.items ?? []}
          selectedItemId={selectedItemId}
          onSelect={onSelect}
          onStockIn={onStockIn}
          onStockOut={onStockOut}
        />
        <CategoryPanel
          category="FOOT RING"
          items={footring?.items ?? []}
          selectedItemId={selectedItemId}
          onSelect={onSelect}
          onStockIn={onStockIn}
          onStockOut={onStockOut}
        />
      </div>
    </div>
  );
}

function CategoryPanel({
  category,
  items,
  selectedItemId,
  onSelect,
  onStockIn,
  onStockOut,
}: {
  category: string;
  items: CnfItem[];
  selectedItemId: string;
  onSelect: (id: string) => void;
  onStockIn: (item: CnfItem) => void;
  onStockOut: (item: CnfItem) => void;
}) {
  const totalBalance = items.reduce((sum, item) => sum + item.currentBalance, 0);

  return (
    <div className="rounded-3xl border border-ccb-border bg-white shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ccb-border bg-ccb-canvas px-5 py-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ccb-muted">{category}</div>
          <div className="text-sm font-bold text-ccb-navy mt-1">{items.length} {items.length === 1 ? "variant" : "variants"}</div>
        </div>
        <span className="rounded-full bg-ccb-navy/10 px-3 py-1 text-[10px] font-bold text-ccb-navy">
          {totalBalance.toLocaleString()} balance
        </span>
      </div>

      <div className={`grid gap-4 p-4 ${items.length > 1 ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-ccb-border bg-ccb-canvas/70 p-6 text-center text-sm text-ccb-muted">
            No items found for {category}
          </div>
        ) : (
          items.map((item, index) => {
            const id = `${item.tabName}-${item.rowNumber}`;
            const isSelected = selectedItemId === id;
            return (
              <div
                key={id}
                onClick={() => onSelect(id)}
                className={`group cursor-pointer rounded-3xl border px-4 py-4 transition ${
                  isSelected
                    ? "border-ccb-blue bg-[#EFF3FF] shadow-[0_10px_30px_-18px_rgba(46,62,168,0.8)]"
                    : "border-ccb-border bg-ccb-canvas/50 hover:border-ccb-blue hover:bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-ccb-navy">{item.variant}</p>
                    <p className="text-[11px] text-ccb-muted mt-1">{item.uom} • {item.category}</p>
                  </div>
                  <span className="rounded-full bg-ccb-navy/10 px-2 py-1 text-[10px] font-bold text-ccb-navy">
                    {item.currentBalance.toLocaleString()}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onStockIn(item); }}
                    className="rounded-2xl border border-ccb-border bg-white px-3 py-2 text-[11px] font-semibold text-ccb-navy transition hover:border-ccb-blue hover:text-ccb-blue"
                  >
                    Stock In +
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onStockOut(item); }}
                    className="rounded-2xl border border-ccb-border bg-white px-3 py-2 text-[11px] font-semibold text-ccb-navy transition hover:border-ccb-red hover:text-ccb-red"
                  >
                    Stock Out −
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function CnfPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("");
  const [range, setRange] = useState<(typeof RANGE_OPTIONS)[number]>("Monthly");
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [modal, setModal] = useState<Modal>(null);

  const { data: tabs = [], error: tabsError } = useQuery({
    queryKey: ["cnf-tabs"],
    queryFn: () => getCnfTabsFn(),
  });

  const defaultTab = useMemo(() => {
    if (!tabs.length) return "";
    const currentMonth = new Date().toLocaleString("en-US", { month: "short" }).toUpperCase();
    return tabs.find((tab) => tab.toUpperCase().startsWith(currentMonth)) ?? tabs[tabs.length - 1];
  }, [tabs]);

  const currentTab = activeTab || defaultTab;

  useEffect(() => {
    if (defaultTab && !activeTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab, activeTab]);

  const { data: rawItems = [], isLoading, error: itemsError } = useQuery({
    queryKey: ["cnf-items", currentTab],
    queryFn: () => getCnfItemsFn({ data: currentTab }),
    enabled: !!currentTab,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });

  const items = useMemo(
    () =>
      rawItems.filter(
        (item) =>
          item.brand &&
          item.category &&
          item.variant &&
          item.brand.toUpperCase() !== "BRAND" &&
          item.category.toUpperCase() !== "PARTS" &&
          item.variant.toUpperCase() !== "VARIANT" &&
          item.variant.toUpperCase() !== "STOCK IN"
      ),
    [rawItems]
  );

  const brands = useMemo(() => {
    const map = new Map<string, CnfItem[]>();
    items.forEach((item) => {
      const brandName = item.brand.trim();
      if (!map.has(brandName)) map.set(brandName, []);
      map.get(brandName)!.push(item);
    });

    return Array.from(map.entries())
      .map(([name, brandItems]) => ({
        id: name.toLowerCase().replace(/\s+/g, "-"),
        name,
        items: brandItems,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  useEffect(() => {
    if (brands.length > 0 && !selectedBrandId) {
      setSelectedBrandId(brands[0].id);
    }
  }, [brands, selectedBrandId]);

  const selectedBrand = useMemo(
    () => brands.find((brand) => brand.id === selectedBrandId) ?? brands[0] ?? null,
    [brands, selectedBrandId]
  );

  useEffect(() => {
    if (!selectedBrand) return;
    if (!selectedItemId || !selectedBrand.items.some((item) => `${item.tabName}-${item.rowNumber}` === selectedItemId)) {
      setSelectedItemId(`${selectedBrand.items[0].tabName}-${selectedBrand.items[0].rowNumber}`);
    }
  }, [selectedBrand, selectedItemId]);

  const selectedItem = useMemo(() => {
    if (!selectedBrand) return null;
    return selectedBrand.items.find((item) => `${item.tabName}-${item.rowNumber}` === selectedItemId) ?? selectedBrand.items[0] ?? null;
  }, [selectedBrand, selectedItemId]);

  const filteredBrands = useMemo(
    () =>
      brands.filter((brand) =>
        (brand.name + brand.items.map((item) => item.category + item.variant).join(" "))
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [brands, search]
  );

  const categories = useMemo(() => {
    if (!selectedBrand) return [];
    const order = ["NAME PLATE", "COLLAR", "FOOT RING", "OTHER"];
    const map = new Map<string, CnfItem[]>();

    selectedBrand.items.forEach((item) => {
      if (!map.has(item.category)) {
        map.set(item.category, []);
      }
      map.get(item.category)!.push(item);
    });

    return order
      .filter((category) => map.has(category))
      .map((category) => ({ category, items: map.get(category)! }));
  }, [selectedBrand]);

  const brandTotals = useMemo(() => {
    if (!selectedBrand) return { initial: 0, received: 0, balance: 0, issued: 0 };
    const received = selectedBrand.items.reduce((sum, item) => sum + item.inQuantity, 0);
    const issued = selectedBrand.items.reduce((sum, item) => sum + item.outQuantity, 0);
    const balance = selectedBrand.items.reduce((sum, item) => sum + item.currentBalance, 0);
    const initial = selectedBrand.items.reduce((sum, item) => sum + item.initialStock, 0);
    return { initial, received, balance, issued };
  }, [selectedBrand]);

  const stockIn = useMutation({
    mutationFn: (data: { tabName: string; rowNumber: number; qty: number }) => cnfStockInFn({ data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cnf-items", currentTab] }),
  });

  const stockOut = useMutation({
    mutationFn: (data: { tabName: string; rowNumber: number; qty: number; day: number }) => cnfStockOutFn({ data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cnf-items", currentTab] }),
  });

  const displayError = tabsError ?? itemsError;

  return (
    <div className="h-screen bg-ccb-canvas overflow-hidden">
      <div className="flex h-full bg-white">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="bg-white border-b border-ccb-border shrink-0">
            <div className="flex items-center justify-between px-8 py-4">
              <div>
                <h1 className="text-[18px] font-bold leading-tight text-ccb-navy">CNF Monitoring</h1>
                <p className="text-[12px] text-ccb-muted">Track Collar, Nameplate, and Footring inventory by brand</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-[11px] uppercase tracking-widest text-ccb-muted">CCB Inventory Clerk</div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ccb-blue text-white text-sm font-bold">AB</div>
              </div>
            </div>
            <div className="h-[3px] bg-ccb-red" />
          </div>

          <div className="flex-1 overflow-hidden flex flex-col bg-ccb-canvas">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-ccb-muted animate-pulse">Loading CNF data...</p>
              </div>
            ) : displayError ? (
              <div className="flex h-full items-center justify-center px-8">
                <p className="max-w-2xl text-center text-ccb-red">Failed to load CNF data: {displayError.message}</p>
              </div>
            ) : !selectedBrand ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-ccb-muted">No CNF data available for {currentTab}</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-7 pt-5 pb-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.35em] text-ccb-muted">
                      Selected: <span className="text-ccb-navy">{selectedBrand.name} — {selectedItem?.category} {selectedItem?.variant}</span>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {tabs.map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveTab(tab)}
                          className={`rounded-full px-4 py-2 text-[11px] font-semibold transition ${
                            currentTab === tab
                              ? "bg-ccb-blue text-white"
                              : "border border-ccb-border bg-white text-ccb-navy hover:border-ccb-blue"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
                    <CnfKpi variant="blue" label="Initial Stock" value={brandTotals.initial.toLocaleString()} unit={selectedItem?.uom} />
                    <CnfKpi variant="blue3" label="Received" value={brandTotals.received.toLocaleString()} unit={selectedItem?.uom} />
                    <CnfKpi variant="blue2" label="Current Balance" value={brandTotals.balance.toLocaleString()} unit={selectedItem?.uom} />
                    <CnfKpi variant="navy" label="Issued" value={brandTotals.issued.toLocaleString()} unit={selectedItem?.uom} />
                  </div>
                </div>

                <div className="flex-1 overflow-hidden flex gap-5 px-7 pb-7">
                  <div className="w-[280px] shrink-0 rounded-3xl bg-white shadow-sm border border-ccb-border overflow-hidden">
                    <div className="border-b border-ccb-border bg-ccb-canvas px-5 py-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ccb-muted">Brands</div>
                    </div>
                    <div className="p-4 border-b border-ccb-border">
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-ccb-muted" />
                        <input
                          type="text"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search brands..."
                          className="w-full rounded-2xl border border-ccb-border bg-white px-10 py-2 text-[13px] text-ccb-navy outline-none focus:border-ccb-blue"
                        />
                      </div>
                    </div>
                    <div className="max-h-[calc(100vh-260px)] overflow-y-auto p-4 space-y-3">
                      {filteredBrands.length === 0 ? (
                        <div className="text-[12px] text-ccb-muted">No brands found</div>
                      ) : (
                        filteredBrands.map((brand) => {
                          const totalBalance = brand.items.reduce((sum, item) => sum + item.currentBalance, 0);
                          const isActive = selectedBrandId === brand.id;
                          return (
                            <button
                              key={brand.id}
                              type="button"
                              onClick={() => {
                                setSelectedBrandId(brand.id);
                                const firstItem = brand.items[0];
                                if (firstItem) setSelectedItemId(`${firstItem.tabName}-${firstItem.rowNumber}`);
                              }}
                              className={`w-full rounded-2xl border p-4 text-left transition ${
                                isActive
                                  ? "border-ccb-blue bg-[#EFF3FF] shadow-sm"
                                  : "border-ccb-border bg-white hover:border-ccb-blue"
                              }`}
                            >
                              <div className="text-[13px] font-bold text-ccb-navy">{brand.name}</div>
                              <div className="text-[11px] text-ccb-muted mt-1">Balance: {totalBalance.toLocaleString()} pcs</div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm border border-ccb-border">
                    <div className="flex items-center justify-between gap-3 border-b border-ccb-border bg-white px-6 py-4">
                      <div>
                        <div className="text-[13px] font-bold text-ccb-navy">{selectedBrand.name} — Inventory Matrix</div>
                        <div className="text-[11px] text-ccb-muted mt-1">{categories.length} categories</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <select
                            value={range}
                            onChange={(e) => setRange(e.target.value as (typeof RANGE_OPTIONS)[number])}
                            className="appearance-none rounded-full border border-ccb-border bg-white px-3 py-2 text-[12px] font-semibold text-ccb-navy outline-none focus:border-ccb-blue"
                          >
                            {RANGE_OPTIONS.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ccb-muted" />
                        </div>
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-full bg-ccb-blue px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-ccb-blue/90"
                        >
                          <Plus className="h-4 w-4" />
                          Add New
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                      <CnfCategoryGrid
                        categories={categories}
                        selectedItemId={selectedItemId}
                        onSelect={setSelectedItemId}
                        onStockIn={(item) => setModal({ kind: "in", item })}
                        onStockOut={(item) => setModal({ kind: "out", item })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {modal && (
        <StockModal
          mode={modal.kind}
          item={modal.item}
          loading={modal.kind === "in" ? stockIn.isPending : stockOut.isPending}
          onClose={() => setModal(null)}
          onSave={(qty) => {
            if (modal.kind === "in") {
              stockIn.mutate({ tabName: modal.item.tabName, rowNumber: modal.item.rowNumber, qty }, {
                onSuccess: () => setModal(null),
              });
            } else {
              stockOut.mutate({ tabName: modal.item.tabName, rowNumber: modal.item.rowNumber, qty, day: new Date().getDate() }, {
                onSuccess: () => setModal(null),
              });
            }
          }}
        />
      )}
    </div>
  );
}
