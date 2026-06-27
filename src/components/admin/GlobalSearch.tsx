import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Package, User, Truck, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'shipment' | 'customer' | 'vehicle' | 'quote';
  title: string;
  subtitle: string;
  metadata?: string;
  link: string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
  const router = useRouter();
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load recent searches');
      }
    }
  }, []);

  useEffect(() => {
    // Keyboard shortcut: Cmd/Ctrl + K
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(async () => {
      await performSearch(query);
      setLoading(false);
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    const searchTerm = searchQuery.toLowerCase().trim();
    const allResults: SearchResult[] = [];

    try {
      // Search shipments
      const { data: shipments } = await supabase
        .from('shipments')
        .select('id, tracking_number, status, pickup_city, delivery_city, customers(full_name), vehicles(make, model, year)')
        .or(`tracking_number.ilike.%${searchTerm}%,pickup_city.ilike.%${searchTerm}%,delivery_city.ilike.%${searchTerm}%`)
        .limit(5);

      if (shipments) {
        shipments.forEach(s => {
          allResults.push({
            id: s.id,
            type: 'shipment',
            title: s.tracking_number,
            subtitle: `${s.pickup_city} → ${s.delivery_city}`,
            metadata: s.vehicles ? `${s.vehicles.year} ${s.vehicles.make} ${s.vehicles.model}` : undefined,
            link: `/admin/shipments/${s.id}`,
          });
        });
      }

      // Search customers
      const { data: customers } = await supabase
        .from('customers')
        .select('id, full_name, email, phone')
        .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .limit(5);

      if (customers) {
        customers.forEach(c => {
          allResults.push({
            id: c.id,
            type: 'customer',
            title: c.full_name,
            subtitle: c.email,
            metadata: c.phone || undefined,
            link: `/admin/customers/${c.id}`,
          });
        });
      }

      // Search vehicles
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('id, make, model, year, vin, color')
        .or(`make.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,vin.ilike.%${searchTerm}%`)
        .limit(5);

      if (vehicles) {
        vehicles.forEach(v => {
          allResults.push({
            id: v.id,
            type: 'vehicle',
            title: `${v.year} ${v.make} ${v.model}`,
            subtitle: v.vin,
            metadata: v.color || undefined,
            link: `/admin/vehicles/${v.id}`,
          });
        });
      }

      // Search quotes
      const { data: quotes } = await supabase
        .from('quotes')
        .select('id, customer_name, customer_email, pickup_city, delivery_city, status')
        .or(`customer_name.ilike.%${searchTerm}%,customer_email.ilike.%${searchTerm}%,pickup_city.ilike.%${searchTerm}%,delivery_city.ilike.%${searchTerm}%`)
        .limit(5);

      if (quotes) {
        quotes.forEach(q => {
          allResults.push({
            id: q.id,
            type: 'quote',
            title: q.customer_name,
            subtitle: `${q.pickup_city} → ${q.delivery_city}`,
            metadata: q.status,
            link: `/admin/quotes/${q.id}`,
          });
        });
      }

      setResults(allResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    }
  };

  const handleSelect = (result: SearchResult) => {
    // Save to recent searches
    const updated = [result, ...recentSearches.filter(r => r.id !== result.id)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));

    // Navigate
    router.push(result.link);
    setOpen(false);
    setQuery('');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'shipment': return <Package className="w-4 h-4" />;
      case 'customer': return <User className="w-4 h-4" />;
      case 'vehicle': return <Truck className="w-4 h-4" />;
      case 'quote': return <FileText className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'shipment': return 'bg-blue-100 text-blue-700';
      case 'customer': return 'bg-green-100 text-green-700';
      case 'vehicle': return 'bg-purple-100 text-purple-700';
      case 'quote': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors w-full max-w-xs"
      >
        <Search className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Search...</span>
        <kbd className="ml-auto px-2 py-0.5 text-xs bg-background border rounded">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 gap-0">
          <div className="flex items-center border-b px-4 py-3">
            <Search className="w-5 h-5 text-muted-foreground mr-3" />
            <Input
              placeholder="Search shipments, customers, vehicles, quotes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
            {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {query.length < 2 && recentSearches.length > 0 && (
              <div className="p-4">
                <p className="text-xs text-muted-foreground mb-3">Recent Searches</p>
                <div className="space-y-1">
                  {recentSearches.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelect(result)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors text-left"
                    >
                      <div className={cn("p-2 rounded", getTypeColor(result.type))}>
                        {getIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{result.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {result.type}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {query.length >= 2 && results.length === 0 && !loading && (
              <div className="p-8 text-center">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No results found</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="p-4">
                <p className="text-xs text-muted-foreground mb-3">
                  {results.length} result{results.length !== 1 ? 's' : ''} found
                </p>
                <div className="space-y-1">
                  {results.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelect(result)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors text-left"
                    >
                      <div className={cn("p-2 rounded", getTypeColor(result.type))}>
                        {getIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{result.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                        {result.metadata && (
                          <p className="text-xs text-muted-foreground truncate">{result.metadata}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {result.type}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
            <span>Press ⌘K to search anywhere</span>
            <span>ESC to close</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}