import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Check, X, Share2 } from "lucide-react";

interface ShoppingListItem {
  id: string;
  shoppingListId: string;
  category: string;
  name: string;
  quantity: string;
  isPurchased: string;
  notes: string | null;
  order: number;
  createdAt: Date;
}

interface ShoppingList {
  id: string;
  userId: string;
  mealPlanId: string;
  title: string;
  weekNumber: number | null;
  createdAt: Date;
  updatedAt: Date;
  items: ShoppingListItem[];
}

const CATEGORIES = [
  "Frutta",
  "Verdura",
  "Proteine",
  "Latticini",
  "Cereali",
  "Frutta Secca",
  "Condimenti",
  "Altro"
];

const CATEGORY_EMOJIS: Record<string, string> = {
  "Frutta": "🍎",
  "Verdura": "🥬",
  "Proteine": "🍗",
  "Latticini": "🥛",
  "Cereali": "🌾",
  "Frutta Secca": "🥜",
  "Condimenti": "🧂",
  "Altro": "📦"
};

export default function ShoppingListPage() {
  const [, params] = useRoute("/lista-spesa/:id");
  const listId = params?.id;
  const { toast } = useToast();
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    category: "Altro",
    notes: ""
  });

  // Fetch shopping list with items
  const { data: shoppingList, isLoading } = useQuery<ShoppingList>({
    queryKey: ["/api/shopping-lists", listId],
    enabled: !!listId,
  });

  // Toggle item purchased status
  const toggleMutation = useMutation({
    mutationFn: (itemId: string) =>
      apiRequest(`/api/shopping-list-items/${itemId}/toggle`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-lists", listId] });
    },
  });

  // Add new item
  const addItemMutation = useMutation({
    mutationFn: (item: typeof newItem) =>
      apiRequest(`/api/shopping-lists/${listId}/items`, {
        method: "POST",
        body: JSON.stringify(item),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-lists", listId] });
      setIsAddingItem(false);
      setNewItem({ name: "", quantity: "", category: "Altro", notes: "" });
      toast({ title: "✅ Articolo aggiunto", description: "L'articolo è stato aggiunto alla lista" });
    },
    onError: () => {
      toast({ 
        title: "❌ Errore", 
        description: "Impossibile aggiungere l'articolo",
        variant: "destructive" 
      });
    },
  });

  // Delete item
  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) =>
      apiRequest(`/api/shopping-list-items/${itemId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-lists", listId] });
      toast({ title: "🗑️ Articolo rimosso", description: "L'articolo è stato eliminato dalla lista" });
    },
  });

  // Share via WhatsApp
  const shareViaWhatsApp = () => {
    if (!shoppingList) return;

    // Group items by category
    const itemsByCategory: Record<string, ShoppingListItem[]> = {};
    shoppingList.items.forEach(item => {
      if (!itemsByCategory[item.category]) {
        itemsByCategory[item.category] = [];
      }
      itemsByCategory[item.category].push(item);
    });

    // Format message
    let message = `🛒 *${shoppingList.title}*\n\n`;
    
    CATEGORIES.forEach(category => {
      const items = itemsByCategory[category];
      if (items && items.length > 0) {
        message += `${CATEGORY_EMOJIS[category]} *${category}*\n`;
        items.forEach(item => {
          const status = item.isPurchased === 'yes' ? '✅' : '⬜';
          message += `${status} ${item.name} - ${item.quantity}\n`;
        });
        message += '\n';
      }
    });

    message += `\n_Generato da La Mia Gazzella_`;

    // Encode for WhatsApp URL
    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encoded}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!shoppingList) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>❌ Lista non trovata</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              La lista della spesa richiesta non esiste o non hai i permessi per visualizzarla.
            </p>
            <Button onClick={() => window.location.href = "/"} data-testid="button-back-home">
              Torna alla Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group items by category
  const itemsByCategory: Record<string, ShoppingListItem[]> = {};
  shoppingList.items.forEach(item => {
    if (!itemsByCategory[item.category]) {
      itemsByCategory[item.category] = [];
    }
    itemsByCategory[item.category].push(item);
  });

  const purchasedCount = shoppingList.items.filter(item => item.isPurchased === 'yes').length;
  const totalCount = shoppingList.items.length;
  const progress = totalCount > 0 ? (purchasedCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2" data-testid="text-list-title">
            🛒 {shoppingList.title}
          </h1>
          <p className="text-slate-600">
            {purchasedCount} di {totalCount} articoli acquistati
          </p>
          
          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-3 mt-4">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
              data-testid="progress-bar"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700" data-testid="button-add-item">
                <Plus className="mr-2 h-4 w-4" />
                Aggiungi Articolo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Aggiungi Articolo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="es: Pomodori"
                    data-testid="input-item-name"
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantità *</Label>
                  <Input
                    id="quantity"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    placeholder="es: 500g"
                    data-testid="input-item-quantity"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                    <SelectTrigger data-testid="select-item-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {CATEGORY_EMOJIS[cat]} {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">Note (opzionale)</Label>
                  <Input
                    id="notes"
                    value={newItem.notes}
                    onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                    placeholder="es: Biologici"
                    data-testid="input-item-notes"
                  />
                </div>
                <Button
                  onClick={() => addItemMutation.mutate(newItem)}
                  disabled={!newItem.name || !newItem.quantity || addItemMutation.isPending}
                  className="w-full"
                  data-testid="button-save-item"
                >
                  {addItemMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Aggiunta in corso...</>
                  ) : (
                    <>Aggiungi</>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            onClick={shareViaWhatsApp}
            variant="outline"
            className="border-green-600 text-green-700 hover:bg-green-50"
            data-testid="button-share-whatsapp"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Condividi su WhatsApp
          </Button>
        </div>

        {/* Shopping List Items by Category */}
        <div className="space-y-6">
          {CATEGORIES.map(category => {
            const items = itemsByCategory[category];
            if (!items || items.length === 0) return null;

            return (
              <Card key={category} className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <span className="text-2xl">{CATEGORY_EMOJIS[category]}</span>
                    {category}
                    <span className="ml-auto text-sm text-slate-600">
                      {items.filter(i => i.isPurchased === 'yes').length}/{items.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    {items.map(item => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          item.isPurchased === 'yes'
                            ? 'bg-slate-50 border-slate-200 opacity-60'
                            : 'bg-white border-slate-200 hover:border-emerald-300'
                        }`}
                        data-testid={`item-${item.id}`}
                      >
                        <button
                          onClick={() => toggleMutation.mutate(item.id)}
                          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            item.isPurchased === 'yes'
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'border-slate-300 hover:border-emerald-500'
                          }`}
                          data-testid={`button-toggle-${item.id}`}
                        >
                          {item.isPurchased === 'yes' && <Check className="h-4 w-4 text-white" />}
                        </button>

                        <div className="flex-1">
                          <div className={`font-semibold ${item.isPurchased === 'yes' ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                            {item.name}
                          </div>
                          <div className="text-sm text-slate-600">
                            {item.quantity}
                            {item.notes && (
                              <span className="ml-2 text-slate-500 italic">({item.notes})</span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => deleteItemMutation.mutate(item.id)}
                          className="flex-shrink-0 text-red-500 hover:text-red-700 transition-colors"
                          data-testid={`button-delete-${item.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {shoppingList.items.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-slate-500 text-lg mb-4">
                📋 La lista della spesa è vuota
              </p>
              <Button onClick={() => setIsAddingItem(true)} data-testid="button-add-first-item">
                <Plus className="mr-2 h-4 w-4" />
                Aggiungi il primo articolo
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
