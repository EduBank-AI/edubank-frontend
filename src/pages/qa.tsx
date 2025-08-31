// Updated QASystem.tsx for TypeScript + shadcn/ui Toasts

import { useState, useEffect } from "react";
import { Brain, FileText, Zap, Copy, RefreshCw, Plus, Minus, Check } from "lucide-react";

import { Toaster } from "~/components/ui/sonner";
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
      toast.error("Missing topic", {
        description: "Please enter a topic to generate questions."
      });
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
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: prompt })
      });
      
      const text = await response.text();
      let data: { answer: string } = { answer: "" };
      
      try {
        data = JSON.parse(text);
      } catch {
        // If backend returned plain text, wrap it as { answer }
        data = { answer: text };
      }
      
      console.log("Raw AI answer:", data.answer);
      const parsedQuestions = parseQuestions(data.answer);
      console.log("Parsed questions:", parsedQuestions);
      setGeneratedQuestions(parsedQuestions);
      toast.success("Questions Generated", {
        description: `${parsedQuestions.length} questions created.` 
      });
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Error", {
        description: "Failed to generate questions."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVariant = async () => {
    if (!variantQuestion.trim()) {
      toast.error("Missing input", {
        description: "Please enter a question to transform."
      });
      return;
    }

    setIsGeneratingVariant(true);

    const prompt = `You are a math word problem transformer.
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
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: prompt })
      });

      const data = await response.json();
      setVariantResponse(data.answer);
      toast.success("Variant Generated");
    } catch (error) {
      console.error("Error fetching variant:", error);
      toast.error("Error", {
        description: "Failed to generate variant."
      });
    } finally {
      setIsGeneratingVariant(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);

    toast.info("Copied!", {
      description: "Question and answer copied to clipboard." 
    });

    setTimeout(() => setCopied(null), 2000);
  };

  const clearQuestions = () => {
    setGeneratedQuestions([]);
    toast.info("Cleared", {
      description: "All generated questions have been cleared." 
    });
  };

  return (
    <div className="min-h-screen bg-primary p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-700 via-violet-600 to-fuchsia-600 rounded-full mb-4">
            <Brain className="w-8 h-8 text-white " />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2"> Question Generator</h1>
          <p className="text-gray-400">Generate intelligent questions and answers based on your content</p>
        </div>

        {/* Generate Questions Section */}
        <div className="bg-gray-800/65 rounded-2xl shadow-xl p-8 mb-8 border border-white/10">
          <div className="flex items-center mb-6">
            <FileText className="w-6 h-6 text-purple-600 mr-3" />
            <h2 className="text-2xl font-semibold text-white">Generate Questions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Topic Input */}
            <div className="md:col-span-2">
              <Label className="block text-sm font-medium text-gray-400 mb-2">Topic</Label>
              <Input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter the topic..."
                className="h-12 w-full px-4 py-3 border text-white border-gray-300 rounded-lg transition-all"
              />
            </div>

            {/* Difficulty Select */}
            <div>
              <Label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</Label>
              {/* <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="cursor-pointer w-full px-4 py-3 border text-white border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              >
                <option value="easy" className="text-gray-600">Easy</option>
                <option value="medium" className="text-gray-600">Medium</option>
                <option value="hard" className="text-gray-600">Hard</option>
              </select> */}

              <Select value={difficulty} onValueChange={setDifficulty} defaultValue="medium">
                <SelectTrigger className="w-full px-4 border text-white border-gray-300 rounded-lg transition-all" style={{ height: "3rem" }}>
                  <SelectValue placeholder="Select difficulty" />
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
          <div className="flex items-center mb-6">
            <label className="text-sm font-medium text-gray-400 mr-4">Number of Questions:</label>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setNumQuestions(Math.max(1, numQuestions - 1))}
                className="p-2 rounded-full bg-gray-100/10 hover:bg-gray-200 border border-gray-200/10  transition-colors cursor-pointer"
              >
                <Minus className="w-4 h-4 text-white hover:text-black transition-colors" />
              </Button>
              <span className="text-xl font-semibold text-white min-w-[2rem] text-center">
                {numQuestions}
              </span>
              <Button
                onClick={() => setNumQuestions(Math.min(20, numQuestions + 1))}
                className="p-2 rounded-full bg-gray-100/10 hover:bg-gray-200 border border-gray-200/10  transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white hover:text-black transition-colors" />
              </Button>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex space-x-4">
            <Button
              onClick={handleGenerateQuestions}
              disabled={isGenerating || !topic.trim()}
              className={`h-12 flex-1 py-3 px-6 rounded-lg font-semibold transition-all cursor-pointer ${
                isGenerating || !topic.trim()
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed text-lg"
                  : "bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg transform hover:-translate-y-0.5 text-lg"
              }`}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating Questions...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>Generate Questions</span>
                </div>
              )}
            </Button>
            
            {generatedQuestions.length > 0 && (
              <Button
                onClick={clearQuestions}
                className="h-12 px-6 py-3 bg-gray-800/70 border-2 border-red-500 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Generated Questions Display */}
        {generatedQuestions.length > 0 && (
          <div className="bg-gray-800/65 rounded-2xl shadow-xl p-8 mb-8 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Generated Questions</h3>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                {generatedQuestions.length} questions
              </span>
            </div>
            
            <div className="space-y-6 ">
              {generatedQuestions.map((qa, index) => (
                <div key={index} className="bg-white shadow-xl border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold text-sm">{index + 1}</span>
                      </div>
                      <h4 className="font-semibold text-gray-800">Question {index + 1}</h4>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(`Q: ${qa.question}\nA: ${qa.answer}`, `q-${qa.id}`)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors bg-transparent cursor-pointer"
                      title="Copy question and answer"
                    >
                      {copied === `q-${qa.id}` ? <Check className="w-4 h-4 text-gray-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
                    </Button>

                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed">{qa.question}</p>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-green-800">Answer</span>
                    </div>
                    <p className="text-green-700 whitespace-pre-wrap">{qa.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate Variants Section */}
        <div className="bg-gray-800/65 rounded-2xl shadow-xl p-8 border border-white/10">
          <div className="flex items-center mb-6">
            <Zap className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-semibold text-white">Generate Question Variants</h2>
          </div>

          <div className="mb-6">
            <Label className="block text-sm font-medium text-gray-400 mb-2">Enter a question to create variants</Label>
            <Textarea 
              value={variantQuestion}
              onChange={(e) => setVariantQuestion(e.target.value)}
              placeholder="Paste a question here to generate a similar variant with different values..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-all resize-none text-white overflow-y-auto max-h-40"
            />
          </div>

          <Button
            onClick={handleGenerateVariant}
            disabled={isGeneratingVariant || !variantQuestion.trim()}
            className={`h-12 w-full py-3 px-6 rounded-lg font-semibold transition-all cursor-pointer ${
              isGeneratingVariant || !variantQuestion.trim()
                ? "bg-gray-100 text-gray-400 cursor-not-allowed text-lg"
                : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5 text-lg"
            }`}
          >
            {isGeneratingVariant ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Generating Variant...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <RefreshCw className="w-5 h-5" />
                <span>Generate Variant</span>
              </div>
            )}
          </Button>

          {/* Display Variant Response */}
          {variantResponse && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span className="font-semibold text-blue-800">Generated Variant</span>
                <Button
                  onClick={() => copyToClipboard(variantResponse, "variant")}
                  className="ml-auto p-2 hover:bg-blue-100 rounded-lg transition-colors bg-transparent cursor-pointer"
                  title="Copy variant"
                >
                  {copied === "variant" ? <Check className="w-4 h-4 text-blue-600" /> : <Copy className="w-4 h-4 text-blue-600" />}
                </Button>

              </div>
              <p className="text-blue-700 whitespace-pre-wrap leading-relaxed">{variantResponse}</p>
            </div>
          )}
        </div>
      </div>
      <Toaster richColors closeButton />
    </div>
  );
};

export default QASystem;