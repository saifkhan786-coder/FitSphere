import { createFileRoute } from "@tanstack/react-router";
import {
  Dumbbell,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  EmptyState,
  PageHeader,
  StatusBadge,
} from "@/components/common/ui-kit";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";

import { exerciseCategories } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/exercises")({
  head: () => ({
    meta: [
      {
        title: "Exercise Library — Smart Gym Admin",
      },
      {
        name: "description",
        content:
          "Curate the gym exercise library with targets, equipment and difficulty.",
      },
      {
        property: "og:title",
        content: "Exercise Library — Smart Gym Admin",
      },
      {
        property: "og:description",
        content:
          "Curate the gym exercise library used by member workouts.",
      },
    ],
  }),
  component: AdminExercises,
});

type Exercise = {
  _id: string;
  name: string;
  category: string;
  difficulty: string;
  instructions: string;
  createdAt: string;
  updatedAt: string;
};

function AdminExercises() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [open, setOpen] = useState(false);

  const [exercises, setExercises] =
    useState<Exercise[]>([]);

  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("Back");

  const [difficulty, setDifficulty] =
    useState("Intermediate");

  const [instructions, setInstructions] =
    useState("");

  const fetchExercises = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/exercises"
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to fetch exercises"
        );
      }

      setExercises(data.exercises);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load exercises");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const handleAddExercise = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem(
        "smartgym.token"
      );

      if (!token) {
        toast.error("Please login again");
        return;
      }

      const response = await fetch(
        "/api/exercises",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            name,
            category: selectedCategory,
            difficulty,
            instructions,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to add exercise"
        );
      }

      setExercises((previousExercises) => [
        data.exercise,
        ...previousExercises,
      ]);

      setName("");
      setSelectedCategory("Back");
      setDifficulty("Intermediate");
      setInstructions("");

      setOpen(false);

      toast.success(
        "Exercise added to the library"
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to add exercise"
      );
    }
  };

  const handleDeleteExercise = async (
    exerciseId: string
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this exercise?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem(
        "smartgym.token"
      );

      if (!token) {
        toast.error("Please login again");
        return;
      }

      const response = await fetch(
        `/api/exercises/${exerciseId}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to delete exercise"
        );
      }

      setExercises((previousExercises) =>
        previousExercises.filter(
          (exercise) =>
            exercise._id !== exerciseId
        )
      );

      toast.success(
        "Exercise deleted successfully"
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete exercise"
      );
    }
  };

  const filtered = useMemo(() => {
    return exercises.filter(
      (exercise) =>
        (category === "all" ||
          exercise.category === category) &&
        exercise.name
          .toLowerCase()
          .includes(
            query.toLowerCase().trim()
          )
    );
  }, [exercises, query, category]);

  return (
    <>
      <PageHeader
        title="Exercise library"
        description={`${exercises.length} exercises across ${exerciseCategories.length} categories`}
        action={
          <Dialog
            open={open}
            onOpenChange={setOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 size-4" />
                Add exercise
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Add exercise
                </DialogTitle>
              </DialogHeader>

              <form
                className="space-y-4"
                onSubmit={handleAddExercise}
              >
                <div className="space-y-2">
                  <Label>Name</Label>

                  <Input
                    required
                    placeholder="Barbell Row"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>

                    <Select
                      value={selectedCategory}
                      onValueChange={
                        setSelectedCategory
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        {exerciseCategories.map(
                          (c) => (
                            <SelectItem
                              key={c}
                              value={c}
                            >
                              {c}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Difficulty</Label>

                    <Select
                      value={difficulty}
                      onValueChange={
                        setDifficulty
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="Beginner">
                          Beginner
                        </SelectItem>

                        <SelectItem value="Intermediate">
                          Intermediate
                        </SelectItem>

                        <SelectItem value="Advanced">
                          Advanced
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Instructions</Label>

                  <Textarea
                    rows={3}
                    placeholder="One step per line"
                    required
                    value={instructions}
                    onChange={(e) =>
                      setInstructions(
                        e.target.value
                      )
                    }
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                >
                  Save exercise
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Search exercises"
            className="pl-9"
          />
        </div>

        <Select
          value={category}
          onValueChange={setCategory}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All categories
            </SelectItem>

            {exerciseCategories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="py-10 text-center text-muted-foreground">
          Loading exercises...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No exercises found"
          description="Try a different search or category."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((exercise) => (
            <Card
              key={exercise._id}
              className="transition-shadow hover:shadow-[var(--shadow-lift)]"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-base font-semibold">
                      {exercise.name}
                    </p>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {exercise.category}
                    </p>
                  </div>

                  <StatusBadge
                    status={exercise.difficulty}
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <Badge variant="secondary">
                    {exercise.category}
                  </Badge>

                  <Badge variant="secondary">
                    {exercise.difficulty}
                  </Badge>
                </div>

                <div className="mt-4 text-sm text-muted-foreground">
                  {exercise.instructions}
                </div>

                <Button
                  variant="destructive"
                  className="mt-4 w-full"
                  onClick={() =>
                    handleDeleteExercise(
                      exercise._id
                    )
                  }
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete exercise
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}