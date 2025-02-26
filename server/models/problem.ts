// models/problem.ts
import mongoose, { Document } from "mongoose";

// Define nested interfaces
interface ProblemData {
  id: number;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  like_count: number;
  dislike_count: number;
  description_body: string;
  accept_count: number;
  submission_count: number;
  acceptance_rate_count: number;
  discussion_count: number;
  related_topics: string[];
  similar_questions: string[];
  solution_count: number;
  code_default_language: string;
  code_body: Record<string, string>;
  status?: string;
}

interface EditorialData {
  editorial_body: string;
}

// Main document interface
export interface DProblem extends Document {
  main: ProblemData;
  editorial: EditorialData;
  test: any[][];
  function_name: string;
}

// Schema definition
const problemSchema = new mongoose.Schema<DProblem>({
  main: {
    id: Number,
    name: String,
    difficulty: String,
    like_count: Number,
    dislike_count: Number,
    description_body: String,
    accept_count: Number,
    submission_count: Number,
    acceptance_rate_count: Number,
    discussion_count: Number,
    related_topics: [String],
    similar_questions: [String],
    solution_count: Number,
    code_default_language: String,
    code_body: Object,
    status: String || null,
  },
  editorial: {
    editorial_body: String,
  },
  test: Array,
  function_name: String,
});

const ProblemModel = mongoose.model<DProblem>("Problem", problemSchema);
export default ProblemModel;
