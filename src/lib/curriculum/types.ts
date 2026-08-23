export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
};

export type ModuleContent = {
  kind: "reflexion" | "escritura" | "quiz" | "info";
  instructions: string;
  rubric?: string[];
  quiz?: QuizQuestion[];
};

export type ModuleWithStatus = {
  id: string;
  title: string;
  description: string | null;
  stage: string | null;
  order_index: number;
  points: number;
  content: ModuleContent;
  status: "bloqueado" | "actual" | "completado";
  pointsAwarded: number | null;
};
