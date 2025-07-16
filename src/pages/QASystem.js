import { useState } from "react";
import { Brain, FileText, Zap, Copy, RefreshCw, Plus, Minus } from "lucide-react";

const QASystem = () => {
  const [numQuestions, setNumQuestions] = useState(5);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [variantQuestion, setVariantQuestion] = useState("");
  const [variantResponse, setVariantResponse] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingVariant, setIsGeneratingVariant] = useState(false);

  // Parse the AI response into structured questions
  const parseQuestions = (response) => {
  if (!response) return [];

  const questionMatches = [...response.matchAll(/\*\*Question (\d+):\*\*/g)];

  if (questionMatches.length === 0) return [];

  const questions = [];

  for (let i = 0; i < questionMatches.length; i++) {
    const questionNum = parseInt(questionMatches[i][1]);
    const qStart = questionMatches[i].index + questionMatches[i][0].length;
    const qEnd =
      i + 1 < questionMatches.length
        ? questionMatches[i + 1].index
        : response.length;

    const section = response.slice(qStart, qEnd).trim();

    // Look for corresponding answer (either **Answer X:** or **Answer:**) inside this section
    const answerMatch = section.match(/\*\*Answer(?: \d+)?:\*\*/);

    let questionText = "";
    let answerText = "";

    if (answerMatch) {
      const splitIndex = section.indexOf(answerMatch[0]);
      questionText = section.slice(0, splitIndex).trim();
      answerText = section.slice(splitIndex + answerMatch[0].length).trim();
    } else {
      // Fallback if no explicit answer marker
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


  // Generate Questions
  const handleGenerateQuestions = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic.");
      return;
    }

    setIsGenerating(true);
    const prompt = `You are an exam question generator.
                    Using the data provided, generate ${numQuestions} unique questions on the topic ${topic} at ${difficulty} difficulty level.

                    For each question:

                    Make sure it is relevant to the topic and difficulty specified.

                    Provide a clear, correct answer immediately after the question.

                    Do not include any additional explanation or commentary.`;

    try {
      // Simulate API call for demo
      const response = await fetch("http://localhost:5000/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: prompt })
      });
      
      const data = await response.json();
      const parsedQuestions = parseQuestions(data.answer);
      setGeneratedQuestions(parsedQuestions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      alert("Error generating questions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate New Variant
  const handleGenerateVariant = async () => {
    if (!variantQuestion.trim()) {
      alert("Please enter a question.");
      return;
    }

    setIsGeneratingVariant(true);
    const prompt = `You are a math word problem transformer.
                    Follow these instructions carefully:

                    1. Take the given problem described in ${variantQuestion}.

                    2. Generate a new version of the question by only changing the numeric values (slightly).

                    3. Preserve the logical structure of the question.

                    4. Then, compute and display the correct answer to the new question.

                    5. Only output the transformed question and its answer. Do not mention the original question or anything else.\
                    
                    Format:

                    Question:
                    <your transformed version of the question>

                    Answer:
                    <correct answer to the transformed question>`;

    try {
      // Simulate API call for demo
      const response = await fetch("http://localhost:5000/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: prompt })
      });
      
      const data = await response.json();
      setVariantResponse(data.answer);
    } catch (error) {
      console.error("Error fetching variant:", error);
      alert("Error generating variant. Please try again.");
    } finally {
      setIsGeneratingVariant(false);
    }
  };

  // Copy question to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  // Clear all generated questions
  const clearQuestions = () => {
    setGeneratedQuestions([]);
  };

  return (
    <div className="min-h-screen bg-background p-4">
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
              <label className="block text-sm font-medium text-gray-400 mb-2">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter the topic..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            {/* Difficulty Select */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Number of Questions */}
          <div className="flex items-center mb-6">
            <label className="text-sm font-medium text-gray-400 mr-4">Number of Questions:</label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setNumQuestions(Math.max(1, numQuestions - 1))}
                className="p-2 rounded-full bg-gray-100/10 hover:bg-gray-200 border border-gray-200/10  transition-colors"
              >
                <Minus className="w-4 h-4 text-white hover:text-black transition-colors" />
              </button>
              <span className="text-xl font-semibold text-white min-w-[2rem] text-center">
                {numQuestions}
              </span>
              <button
                onClick={() => setNumQuestions(Math.min(20, numQuestions + 1))}
                className="p-2 rounded-full bg-gray-100/10 hover:bg-gray-200 border border-gray-200/10  transition-colors"
              >
                <Plus className="w-4 h-4 text-white hover:text-black transition-colors" />
              </button>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex space-x-4">
            <button
              onClick={handleGenerateQuestions}
              disabled={isGenerating || !topic.trim()}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                isGenerating || !topic.trim()
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg transform hover:-translate-y-0.5"
              }`}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating Questions...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>Generate Questions</span>
                </div>
              )}
            </button>
            
            {generatedQuestions.length > 0 && (
              <button
                onClick={clearQuestions}
                className="px-6 py-3 bg-gray-800/70 border border-gray-300/10 rounded-lg text-gray-100 hover:bg-gray-200 hover:text-gray-800 transition-colors"
              >
                Clear All
              </button>
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
                    <button
                      onClick={() => copyToClipboard(`Q: ${qa.question}\nA: ${qa.answer}`)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy question and answer"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
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
            <label className="block text-sm font-medium text-gray-400 mb-2">Enter a question to create variants</label>
            <textarea
              value={variantQuestion}
              onChange={(e) => setVariantQuestion(e.target.value)}
              placeholder="Paste a question here to generate a similar variant with different values..."
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          <button
            onClick={handleGenerateVariant}
            disabled={isGeneratingVariant || !variantQuestion.trim()}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
              isGeneratingVariant || !variantQuestion.trim()
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5"
            }`}
          >
            {isGeneratingVariant ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating Variant...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <RefreshCw className="w-5 h-5" />
                <span>Generate Variant</span>
              </div>
            )}
          </button>

          {/* Display Variant Response */}
          {variantResponse && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span className="font-semibold text-blue-800">Generated Variant</span>
                <button
                  onClick={() => copyToClipboard(variantResponse)}
                  className="ml-auto p-2 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Copy variant"
                >
                  <Copy className="w-4 h-4 text-blue-600" />
                </button>
              </div>
              <p className="text-blue-700 whitespace-pre-wrap leading-relaxed">{variantResponse}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QASystem;