import { Package, AlertCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Sidebar from '../../components/layout/Sidebar';
import Footer from '../../components/layout/Footer';

const PLACEHOLDER_ITEMS = [
  { name: 'Rice (Samba)', unit: 'kg',  stock: 45,  min: 10, color: 'from-emerald-500 to-green-400' },
  { name: 'Chicken',      unit: 'kg',  stock: 12,  min: 15, color: 'from-red-500 to-rose-400'      },
  { name: 'Vegetables',   unit: 'kg',  stock: 8,   min: 10, color: 'from-amber-500 to-yellow-400'  },
  { name: 'Coconut Oil',  unit: 'L',   stock: 20,  min: 5,  color: 'from-cyan-500 to-blue-400'     },
  { name: 'Flour',        unit: 'kg',  stock: 30,  min: 10, color: 'from-aura-500 to-aura-400'     },
  { name: 'Sugar',        unit: 'kg',  stock: 25,  min: 8,  color: 'from-pink-500 to-rose-400'     },
];

export default function InventoryPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-6 lg:px-8 pt-8 pb-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white flex items-center gap-3">
              <Package className="text-aura-400" size={28} />
              Inventory
            </h1>
            <p className="text-dark-400 mt-1 text-sm">Stock levels and ingredient tracking</p>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            Preview Data
          </span>
        </div>

        <div className="flex-1 px-6 lg:px-8 pb-8 space-y-6">

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-amber-400">
            <AlertCircle size={16} className="flex-shrink-0" />
            Inventory tracking backend is coming soon. Showing sample data.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLACEHOLDER_ITEMS.map((item) => {
              const pct = Math.min(100, Math.round((item.stock / (item.min * 3)) * 100));
              const low = item.stock < item.min;
              return (
                <Card key={item.name} hover={false} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color}
                                    flex items-center justify-center`}>
                      <Package size={18} className="text-white" />
                    </div>
                    {low && (
                      <span className="px-2 py-0.5 rounded-lg bg-red-500/15 text-red-400 text-xs font-semibold">
                        Low
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{item.name}</p>
                    <p className="text-xs text-dark-500 mt-0.5">Min: {item.min} {item.unit}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-dark-400">In stock</span>
                      <span className={`text-sm font-bold ${low ? 'text-red-400' : 'text-white'}`}>
                        {item.stock} {item.unit}
                      </span>
                    </div>
                    <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

        </div>

        <Footer />
      </div>
    </div>
  );
}
