import { createFileRoute } from "@tanstack/react-router";
import { Bot, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/common/ui-kit";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/member/coach")({
  head: () => ({
    meta: [
      { title: "AI Fitness Coach — Smart Gym" },
      { name: "description", content: "Ask the Smart Gym AI coach about workouts, form, recovery and nutrition guidance." },
      { property: "og:title", content: "AI Fitness Coach — Smart Gym" },
      { property: "og:description", content: "Workout, form and nutrition guidance from your AI coach." },
    ],
  }),
  component: CoachPage,
});

interface Msg {
  id: number;
  role: "user" | "coach";
  text: string;
}

const suggestions = [
  "Build a 4-day split for me",
  "How much protein should I eat?",
  "Best exercises for chest?",
  "How do I fix my squat form?",
];

function reply(prompt: string) {
  const q = prompt.toLowerCase();
  if (q.includes("protein"))
    return "Aim for about 1.6–2.0 g of protein per kg of bodyweight. At 58 kg that's roughly 95–115 g a day — spread it across 4 meals with eggs, chicken, paneer, dal and a whey shake post-workout.";
  if (q.includes("split") || q.includes("plan"))
    return "A solid 4-day split: Day 1 Chest + Triceps, Day 2 Back + Biceps, Day 3 Legs + Core, Day 4 Shoulders + Arms. Keep 6–8 working sets per muscle group, 8–12 reps, and add ~2.5 kg once you hit the top of your rep range.";
  if (q.includes("chest"))
    return "Prioritise bench press, incline dumbbell press and cable fly. Two pressing movements plus one fly for stretch is plenty — 3–4 sets each with 60–90 s rest.";
  if (q.includes("squat") || q.includes("form"))
    return "For squats: brace your core, keep the bar over mid-foot, push your knees out over your toes, and descend until your hip crease passes your knee. Film a set from the side and drop the weight if your lower back rounds.";
  if (q.includes("fat") || q.includes("weight loss"))
    return "Fat loss comes from a modest calorie deficit (roughly 300–500 kcal below your TDEE), high protein, 8–10k steps a day and keeping your strength work heavy so you retain muscle.";
  if (q.includes("rest") || q.includes("recovery"))
    return "Recovery is where progress happens: 7–8 hours of sleep, at least one full rest day a week, and light walking or mobility on off days. Sore for more than 72 hours means your last session was too much volume.";
  return "Great question! Stay consistent with 4–5 sessions a week, progressively add load, hit your protein target and sleep well. Tell me your current goal — muscle gain, fat loss or endurance — and I'll tailor a plan.";
}

function CoachPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 0,
      role: "coach",
      text: "Hi Rahul 👋 I'm your AI fitness coach. Ask me about workouts, form, recovery or nutrition and I'll guide you.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function send(text: string) {
    const value = text.trim();
    if (!value) return;
    setMessages((m) => [...m, { id: Date.now(), role: "user", text: value }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { id: Date.now() + 1, role: "coach", text: reply(value) }]);
      setTyping(false);
    }, 800);
  }

  return (
    <>
      <PageHeader title="AI Fitness Coach" description="Personalised training and nutrition guidance" />

      <Card className="flex h-[calc(100vh-16rem)] min-h-[28rem] flex-col">
        <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-5">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
                    m.role === "coach" ? "bg-accent text-accent-foreground" : "bg-secondary",
                  )}
                >
                  {m.role === "coach" ? <Bot className="size-4" /> : <User className="size-4" />}
                </div>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                    m.role === "coach" ? "bg-secondary" : "bg-primary text-primary-foreground",
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Bot className="size-4" />
                </div>
                <div className="rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground">Coach is typing…</div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <Button key={s} size="sm" variant="outline" onClick={() => send(s)}>
                {s}
              </Button>
            ))}
          </div>

          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask your coach anything…" />
            <Button type="submit" size="icon">
              <Send className="size-4" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground">
            AI guidance is general fitness information, not medical advice.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
