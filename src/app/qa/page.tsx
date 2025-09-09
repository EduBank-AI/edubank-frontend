"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { 
  Brain, 
  FileText, 
  Zap, 
  Copy, 
  RefreshCw, 
  Plus, 
  Minus,
  Check 
} from "lucide-react";

import { toast } from "sonner"
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"

import MouseFollow from "~/components/MouseFollow";
import NavBar from "~/components/NavBar";

interface QA {
  id: number;
  question: string;
  answer: string;
}

const QASystem = () => {
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [topic, setTopic] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [generatedQuestions, setGeneratedQuestions] = useState<QA[]>([]);
  const [variantQuestion, setVariantQuestion] = useState<string>("");
  const [variantResponse, setVariantResponse] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isGeneratingVariant, setIsGeneratingVariant] = useState<boolean>(false);
  const [copied, setCopied] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || token === "") {
      router.push("/404");
    }
  }, [router]);

  const parseQuestions = (response: string): QA[] => {
    if (!response) return [];

    const questionMatches = [...response.matchAll(/\*\*Question (\d+):\*\*/g)];
    if (questionMatches.length === 0) return [];

    const questions: QA[] = [];

    for (let i = 0; i < questionMatches.length; i++) {
      const match = questionMatches[i];
      const nextMatch = questionMatches[i + 1];

      const questionNum = parseInt(match?.[1] ?? `${i + 1}`);
      const qStart = (match?.index ?? 0) + (match?.[0]?.length ?? 0);
      const qEnd = nextMatch?.index ?? response.length;

      const section = response.slice(qStart, qEnd).trim();
      const answerMatch = section.match(/\*\*Answer(?: \d+)?:\*\*/);

      let questionText = "";
      let answerText = "";

      if (answerMatch) {
        const splitIndex = section.indexOf(answerMatch[0]);
        questionText = section.slice(0, splitIndex).trim();
        answerText = section.slice(splitIndex + answerMatch[0].length).trim();
      } else {
        const lines = section.split("\n").filter((line) => line.trim());
        questionText = lines[0] || "";
        answerText = lines.slice(1).join("\n").trim();
      }
    
      questions.push({
        id: questionNum,
        question: questionText,
        answer: answerText || "No answer provided",
      });
    }

    return questions;
  };

  const handleGenerateQuestions = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic to generate questions.");
      return;
    }

    setIsGenerating(true);

    const prompt = `You are an exam question generator.
      Using the data provided, generate ${numQuestions} unique questions on the topic ${topic} at ${difficulty} difficulty level.

      For each question:

      Make sure it is relevant to the topic and difficulty specified.
      Provide a clear, correct answer immediately after the question.
      Do not include any additional explanation or commentary.
      
      Format:
      **Question <question number>:**
      <Question Text>
      **Answer <answer number>:**
      <Answer Text>`;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ question: prompt })
      });
      
      const text = await response.text();
      let data: { answer: string } = { answer: "" };
      
      try {
        data = JSON.parse(text);
      } catch {
        data = { answer: text };
      }
      
      console.log("Raw AI answer:", data.answer);
      const parsedQuestions = parseQuestions(data.answer);
      console.log("Parsed questions:", parsedQuestions);
      setGeneratedQuestions(parsedQuestions);
      toast.success(`${parsedQuestions.length} questions generated successfully`);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to generate questions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVariant = async () => {
    if (!variantQuestion.trim()) {
      toast.error("Please enter a question to transform.");
      return;
    }

    setIsGeneratingVariant(true);

    const prompt = `You are a word problem transformer.
      1. Take the given problem described in ${variantQuestion}.
      2. Generate a new version of the question by only changing the numeric values (slightly).
      3. Preserve the logical structure of the question.
      4. Then, compute and display the correct answer to the new question.
      5. Only output the transformed question and its answer.

      Format:
      Question:
      <your transformed version of the question>
      Answer:
      <correct answer to the transformed question>`;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" ,
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ question: prompt })
      });

      const data = await response.json();
      setVariantResponse(data.answer);
      toast.success("Question variant generated successfully");
    } catch (error) {
      console.error("Error fetching variant:", error);
      toast.error("Failed to generate variant. Please try again.");
    } finally {
      setIsGeneratingVariant(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(null), 2000);
  };

  const clearQuestions = () => {
    setGeneratedQuestions([]);
    toast.success("All questions cleared");
  };

  return (
    <>
    <MouseFollow />
    <NavBar />
    
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Question Generator
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate intelligent questions and answers based on your content
          </p>
        </div>

        {/* Generate Questions Section */}
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl rounded-2xl p-6 mb-6">
          <div className="flex items-center space-x-3 mb-6 border-b border-gray-300 dark:border-gray-800 pb-4">
            <div className="p-2 bg-blue-500/10 dark:bg-blue-400/10 rounded-lg">
              <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Generate Questions
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create custom questions from your uploaded content
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Topic Input */}
              <div className="md:col-span-2">
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Topic
                </Label>
                <Input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter the topic for questions..."
                  className="h-10"
                />
              </div>

              {/* Difficulty Select */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty
                </Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Number of Questions */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Number of Questions
              </Label>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => setNumQuestions(Math.max(1, numQuestions - 1))}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100 min-w-[2rem] text-center">
                  {numQuestions}
                </span>
                <Button
                  onClick={() => setNumQuestions(Math.min(20, numQuestions + 1))}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleGenerateQuestions}
                disabled={isGenerating || !topic.trim()}
                className="flex-1 h-11"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Generate Questions
                  </>
                )}
              </Button>
              
              {generatedQuestions.length > 0 && (
                <Button
                  onClick={clearQuestions}
                  variant="outline"
                  className="px-4"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Generated Questions Display */}
        {generatedQuestions.length > 0 && (
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6 border-b border-gray-300 dark:border-gray-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/10 dark:bg-green-400/10 rounded-lg">
                  <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Generated Questions
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {generatedQuestions.length} question{generatedQuestions.length !== 1 ? 's' : ''} ready
                  </p>
                </div>
              </div>
              <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                {generatedQuestions.length}
              </div>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              {generatedQuestions.map((qa, index) => (
                <div 
                  key={index} 
                  className="bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                        Question {index + 1}
                      </span>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(`Q: ${qa.question}\nA: ${qa.answer}`, `q-${qa.id}`)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      {copied === `q-${qa.id}` ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
                      {qa.question}
                    </p>
                  </div>
                  
                  <div className="bg-green-50/50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide">
                        Answer
                      </span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300 whitespace-pre-wrap">
                      {qa.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate Variants Section */}
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-6 border-b border-gray-300 dark:border-gray-800 pb-4">
            <div className="p-2 bg-blue-500/10 dark:bg-blue-400/10 rounded-lg">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Generate Question Variants
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create variations of existing questions with different values
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Original Question
              </Label>
              <Textarea 
                value={variantQuestion}
                onChange={(e) => setVariantQuestion(e.target.value)}
                placeholder="Paste a question here to generate a similar variant with different values..."
                className="min-h-[100px] resize-none"
              />
            </div>

            <Button
              onClick={handleGenerateVariant}
              disabled={isGeneratingVariant || !variantQuestion.trim()}
              className="w-full h-11"
            >
              {isGeneratingVariant ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Generating Variant...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate Variant
                </>
              )}
            </Button>

            {/* Display Variant Response */}
            {variantResponse && (
              <div className="bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                      Generated Variant
                    </span>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(variantResponse, "variant")}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    {copied === "variant" ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-blue-600" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300 whitespace-pre-wrap leading-relaxed">
                  {variantResponse}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default QASystem;