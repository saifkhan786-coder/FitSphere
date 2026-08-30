import { createFileRoute } from "@tanstack/react-router";
import { LineChart as LineChartIcon, Plus, Ruler, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { PageHeader, StatCard } from "@/components/common/ui-kit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { weightProgress, workoutPerformance } from "@/lib/mock-data";

export const Route = createFileRoute("/member/progress")({
  head: () => ({
    meta: [
      { title: "Progress — Smart Gym" },
      { name: "description", content: "Track weight, body measurements and strength progression over time with charts." },
      { property: "og:title", content: "Progress — Smart Gym" },
      { property: "og:description", content: "Weight, measurements and strength progression charts." },
    ],
  }),
  component: ProgressPage,
});

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
} as const;

function ProgressPage() {
  const [open, setOpen] = useState(false);
  const first = weightProgress[0]!;
  const last = weightProgress[weightProgress.length - 1]!;

  return (
    <>
      <PageHeader
        title="Progress"
        description="Body composition and strength over the last 5 months"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 size-4" /> Add record
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add progress record</DialogTitle>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  toast.success("Progress record saved");
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" defaultValue="2026-08-25" />
                  </div>
                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <Input type="number" step="0.1" defaultValue={58} />
                  </div>
                  <div className="space-y-2">
                    <Label>Chest (in)</Label>
                    <Input type="number" step="0.1" defaultValue={38} />
                  </div>
                  <div className="space-y-2">
                    <Label>Waist (in)</Label>
                    <Input type="number" step="0.1" defaultValue={30} />
                  </div>
                  <div className="space-y-2">
                    <Label>Arms (in)</Label>
                    <Input type="number" step="0.1" defaultValue={12.4} />
                  </div>
                  <div className="space-y-2">
                    <Label>Thighs (in)</Label>
                    <Input type="number" step="0.1" defaultValue={21.3} />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Save record
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Weight gained" value={`+${(last.weight - first.weight).toFixed(1)} kg`} icon={TrendingUp} tone="success" />
        <StatCard label="Waist reduced" value={`-${(first.waist - last.waist).toFixed(1)} in`} icon={Ruler} tone="accent" />
        <StatCard label="Bench press" value="40 kg" icon={LineChartIcon} tone="info" delta="+7.5 kg in 5 weeks" />
        <StatCard label="Weekly volume" value="7,300 kg" icon={TrendingUp} tone="warning" />
      </div>

      <Tabs defaultValue="weight" className="mt-6">
        <TabsList>
          <TabsTrigger value="weight">Weight</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="strength">Strength</TabsTrigger>
        </TabsList>

        <TabsContent value="weight">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Body weight trend</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightProgress} margin={{ left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis domain={[50, 62]} tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="weight" stroke="var(--color-accent)" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="measurements">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Body measurements (inches)</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightProgress} margin={{ left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Line type="monotone" dataKey="chest" stroke="var(--color-chart-1)" strokeWidth={2} />
                  <Line type="monotone" dataKey="waist" stroke="var(--color-chart-2)" strokeWidth={2} />
                  <Line type="monotone" dataKey="arms" stroke="var(--color-chart-3)" strokeWidth={2} />
                  <Line type="monotone" dataKey="thighs" stroke="var(--color-chart-4)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strength">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lift progression & volume</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workoutPerformance} margin={{ left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="week" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Bar dataKey="bench" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="squat" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="deadlift" fill="var(--color-chart-3)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
