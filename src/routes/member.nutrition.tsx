import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, UtensilsCrossed } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { MacroBar, PageHeader, StatCard } from "@/components/common/ui-kit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { foods, nutritionTargets, seedMealLog } from "@/lib/mock-data";

export const Route = createFileRoute("/member/nutrition")({
  head: () => ({
    meta: [
      { title: "Nutrition Tracker — Smart Gym" },
      { name: "description", content: "Log breakfast, lunch, snacks and dinner and track calories and macros against targets." },
      { property: "og:title", content: "Nutrition Tracker — Smart Gym" },
      { property: "og:description", content: "Log meals and track calories and macros." },
    ],
  }),
  component: NutritionPage,
});

const MEALS = ["Breakfast", "Lunch", "Snacks", "Dinner"] as const;

function NutritionPage() {
  const [log, setLog] = useState<Record<string, { foodId: string; qty: number }[]>>(() =>
    JSON.parse(JSON.stringify(seedMealLog)),
  );
  const [query, setQuery] = useState("");

  const totals = useMemo(() => {
    const t = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    Object.values(log).forEach((entries) =>
      entries.forEach((entry) => {
        const f = foods.find((x) => x.id === entry.foodId);
        if (!f) return;
        t.calories += f.calories * entry.qty;
        t.protein += f.protein * entry.qty;
        t.carbs += f.carbs * entry.qty;
        t.fat += f.fat * entry.qty;
        t.fiber += f.fiber * entry.qty;
      }),
    );
    return t;
  }, [log]);

  const matches = foods.filter((f) => f.name.toLowerCase().includes(query.toLowerCase().trim()));

  function addFood(meal: string, foodId: string) {
    setLog((prev) => ({ ...prev, [meal]: [...(prev[meal] ?? []), { foodId, qty: 1 }] }));
    toast.success("Food added to " + meal);
  }

  function removeFood(meal: string, index: number) {
    setLog((prev) => ({ ...prev, [meal]: (prev[meal] ?? []).filter((_, i) => i !== index) }));
  }

  return (
    <>
      <PageHeader title="Nutrition" description="Today's meal log and macro breakdown" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Calories" value={`${Math.round(totals.calories)} kcal`} icon={UtensilsCrossed} tone="warning" />
        <StatCard label="Protein" value={`${Math.round(totals.protein)} g`} icon={UtensilsCrossed} tone="success" />
        <StatCard label="Carbs" value={`${Math.round(totals.carbs)} g`} icon={UtensilsCrossed} tone="info" />
        <StatCard label="Fat" value={`${Math.round(totals.fat)} g`} icon={UtensilsCrossed} tone="accent" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Meal log</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="Breakfast">
              <TabsList className="mb-4 flex-wrap">
                {MEALS.map((m) => (
                  <TabsTrigger key={m} value={m}>
                    {m}
                  </TabsTrigger>
                ))}
              </TabsList>
              {MEALS.map((meal) => (
                <TabsContent key={meal} value={meal} className="space-y-4">
                  <div className="space-y-2">
                    {(log[meal] ?? []).length === 0 && (
                      <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                        Nothing logged for {meal.toLowerCase()} yet.
                      </p>
                    )}
                    {(log[meal] ?? []).map((entry, i) => {
                      const f = foods.find((x) => x.id === entry.foodId);
                      if (!f) return null;
                      return (
                        <div key={`${entry.foodId}-${i}`} className="flex items-center justify-between rounded-lg bg-secondary/60 px-4 py-3">
                          <div>
                            <p className="text-sm font-medium">
                              {f.name} <span className="text-muted-foreground">× {entry.qty}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {f.serving} · {f.calories * entry.qty} kcal · P {f.protein * entry.qty}g
                            </p>
                          </div>
                          <Button size="icon" variant="ghost" onClick={() => removeFood(meal, i)}>
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-2 rounded-lg border border-border p-4">
                    <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search food to add…" />
                    <div className="max-h-48 space-y-1 overflow-y-auto">
                      {matches.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => addFood(meal, f.id)}
                          className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                        >
                          <span>
                            {f.name} <span className="text-xs text-muted-foreground">({f.serving})</span>
                          </span>
                          <span className="flex items-center gap-2 text-xs text-muted-foreground">
                            {f.calories} kcal <Plus className="size-3.5" />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Daily targets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MacroBar label="Calories" value={totals.calories} target={nutritionTargets.calories} unit="kcal" />
            <MacroBar label="Protein" value={totals.protein} target={nutritionTargets.protein} unit="g" colorVar="--color-chart-2" />
            <MacroBar label="Carbs" value={totals.carbs} target={nutritionTargets.carbs} unit="g" colorVar="--color-chart-3" />
            <MacroBar label="Fat" value={totals.fat} target={nutritionTargets.fat} unit="g" colorVar="--color-chart-4" />
            <MacroBar label="Fiber" value={totals.fiber} target={nutritionTargets.fiber} unit="g" colorVar="--color-chart-5" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
