import { useState } from "react";
import axios from "axios";

const QASystem = () => {
  const [numQuestions, setNumQuestions] = useState(5);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [variantQuestion, setVariantQuestion] = useState("");
  const [variantResponse, setVariantResponse] = useState("");

  // Generate Questions
  const handleGenerateQuestions = async () => {
    if (!topic) {
      alert("Please enter a topic.");
      return;
    }

    const prompt = `Give me ${numQuestions} questions on the topic ${topic} at ${difficulty} difficulty level based on the data given along with the answers.`;

    try {
      const response = await axios.post("http://localhost:5000/ai", { question: prompt });
      const answer = response.data.answer;

      // Normalize to array
      const questions = Array.isArray(answer) ? answer : [answer];
      setGeneratedQuestions(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  // Generate New Variant
  const handleGenerateVariant = async () => {
    if (!variantQuestion) {
      alert("Please enter a question.");
      return;
    }

    const prompt = `Give me only a question and answer it. Change the values and make it very slightly different. ${variantQuestion}`;

    try {
      const response = await axios.post("http://localhost:5000/ai", { question: prompt });
      setVariantResponse(response.data.answer);
    } catch (error) {
      console.error("Error fetching variant:", error);
    }
  };

  return (
    <div>
      <h2>QA System</h2>

      {/* Generate Questions Section */}
      <div>
        <h3>Generate Questions</h3>
        <input type="number" value={numQuestions} onChange={(e) => setNumQuestions(e.target.value)} placeholder="Number of questions" />
        <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic" />
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button onClick={handleGenerateQuestions}>Generate Questions</button>

        {/* Display Generated Questions */}
        <ul>
          {generatedQuestions.map((q, index) => (
            <li key={index}>{q}</li>
          ))}
        </ul>
      </div>

      {/* Generate Variants Section */}
      <div>
        <h3>Generate New Variants</h3>
        <input type="text" value={variantQuestion} onChange={(e) => setVariantQuestion(e.target.value)} placeholder="Enter a question" />
        <button onClick={handleGenerateVariant}>Generate Variant</button>

        {/* Display Variant Response */}
        {variantResponse && <p><strong>New Variant:</strong> {variantResponse}</p>}
      </div>
    </div>
  );
};

export default QASystem;
