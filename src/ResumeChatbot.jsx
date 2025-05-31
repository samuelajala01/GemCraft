import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, FileText, Download, Edit } from "lucide-react";

const ResumeChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "Hi! I'll help you build a comprehensive resume. I'll ask questions naturally and you can provide as much or as little detail as you'd like. Let's start with your basic info - what's your full name and email?",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedPDF, setGeneratedPDF] = useState(null);
  const [collectedData, setCollectedData] = useState({
    personalInfo: {},
    jobTarget: "",
    jobDescription: "",
    experience: [],
    skills: [],
    education: [],
    isComplete: false,
  });

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (type, content) => {
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        type,
        content,
        timestamp: new Date(),
      },
    ]);
  };

  // Use the existing AI backend to extract information
  const extractInfoFromMessage = async (userMessage) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/extract-info`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage,
            currentData: collectedData,
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        return result.data;
      } else {
        console.error("Extraction failed:", result.error);
        return {};
      }
    } catch (error) {
      console.error("Extraction error:", error);
      return {};
    }
  };

  // Use the existing AI backend to get next question
  const getNextQuestion = async (currentData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/generate-next-question`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentData,
            conversationHistory: messages,
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        return result.question;
      } else {
        return "What else would you like to tell me about your background?";
      }
    } catch (error) {
      console.error("Question generation error:", error);
      return "Could you share more details about your experience?";
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    addMessage("user", userMessage);
    setInput("");
    setLoading(true);

    try {
      // Extract information using AI
      const extractedInfo = await extractInfoFromMessage(userMessage);

      // Update collected data by merging with extracted info
      const updatedData = {
        personalInfo: {
          ...collectedData.personalInfo,
          ...extractedInfo.personalInfo,
        },
        jobTarget: extractedInfo.jobTarget || collectedData.jobTarget,
        jobDescription:
          extractedInfo.jobDescription || collectedData.jobDescription,
        experience: [
          ...collectedData.experience,
          ...(extractedInfo.experience || []),
        ],
        skills: [
          ...new Set([
            ...collectedData.skills,
            ...(extractedInfo.skills || []),
          ]),
        ],
        education: [
          ...collectedData.education,
          ...(extractedInfo.education || []),
        ],
      };

      // Check if we have enough basic info to proceed
      updatedData.isComplete =
        updatedData.personalInfo.name &&
        updatedData.personalInfo.email &&
        updatedData.jobTarget &&
        (updatedData.experience.length > 0 || updatedData.skills.length > 0);

      setCollectedData(updatedData);

      // Get next question using AI
      const nextQuestion = await getNextQuestion(updatedData);

      setTimeout(() => {
        if (
          updatedData.isComplete &&
          !nextQuestion.toLowerCase().includes("generate") &&
          !nextQuestion.toLowerCase().includes("ready")
        ) {
          addMessage(
            "bot",
            "Perfect! I have enough information to create your resume. Would you like me to generate it now, or is there anything else you'd like to add?"
          );
        } else {
          addMessage("bot", nextQuestion);
        }
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Message processing error:", error);
      addMessage(
        "bot",
        "Sorry, I had trouble processing that. Could you try again?"
      );
      setLoading(false);
    }
  };

  const generateResume = async () => {
    setLoading(true);
    addMessage("bot", "Perfect! I'm generating your tailored resume now... ✨");

    try {
      // Format data for the build-from-chat endpoint
      const formattedData = {
        extractedData: {
          personalInfo: collectedData.personalInfo,
          jobTarget: collectedData.jobTarget,
          jobDescription: collectedData.jobDescription,
          experience: collectedData.experience,
          education: collectedData.education,
          skills: collectedData.skills,
        },
      };

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/build-from-chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formattedData),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const pdfUrl = URL.createObjectURL(blob);
        setGeneratedPDF(pdfUrl);
        addMessage(
          "bot",
          "🎉 Your resume is ready! I've created it specifically tailored to your background. You can preview and download it below. If you want to make changes, just let me know!"
        );
      } else {
        addMessage(
          "bot",
          "I encountered an issue generating your resume. Let me try again."
        );
      }
    } catch (error) {
      console.error("Resume generation error:", error);
      addMessage(
        "bot",
        "Sorry, there was a technical issue. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedPDF) return;
    const link = document.createElement("a");
    link.href = generatedPDF;
    link.download = `${collectedData.personalInfo.name || "resume"}.pdf`;
    link.click();
  };

  const getDataSummary = () => {
    const data = collectedData;
    const sections = [];

    if (data.personalInfo.name) sections.push("✓ Contact Info");
    if (data.jobTarget) sections.push("✓ Target Role");
    if (data.experience.length > 0)
      sections.push(`✓ ${data.experience.length} Experience(s)`);
    if (data.education.length > 0) sections.push("✓ Education");
    if (data.skills.length > 0) sections.push(`✓ ${data.skills.length} Skills`);

    return sections;
  };

  return (
    <div className="max-w-4xl mx-auto h-screen flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="w-6 h-6" />
          <h2 className="text-xl font-bold">JobCraft Builder</h2>
        </div>
        {getDataSummary().length > 0 && (
          <div className="text-sm opacity-90">
            {getDataSummary().join(" • ")}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.type === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === "user" ? "bg-blue-100" : "bg-gray-100"
              }`}
            >
              {message.type === "user" ? (
                <User className="w-4 h-4 text-blue-600" />
              ) : (
                <Bot className="w-4 h-4 text-gray-600" />
              )}
            </div>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.type === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-gray-600" />
            </div>
            <div className="bg-gray-100 px-4 py-3 rounded-2xl">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Generate Resume Button */}
      {collectedData.isComplete && !generatedPDF && (
        <div className="border-t p-4 bg-gray-50">
          <button
            onClick={generateResume}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5" />
            Generate My Resume
          </button>
        </div>
      )}

      {/* PDF Actions */}
      {generatedPDF && (
        <div className="border-t p-4 bg-gray-50">
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => window.open(generatedPDF, "_blank")}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Preview PDF
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={() =>
                addMessage(
                  "bot",
                  "What would you like to change or improve in your resume?"
                )
              }
              className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Make Changes
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your response... (be as detailed as you want)"
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Tip: You can be conversational! Include as much detail as you want
          - I'll organize it properly.
        </p>

        {/* Data Preview */}
        {Object.keys(collectedData.personalInfo).length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2 text-sm">
              Information Collected:
            </h4>
            <div className="text-xs text-blue-700 space-y-1">
              {collectedData.personalInfo.name && (
                <p>
                  <strong>Name:</strong> {collectedData.personalInfo.name}
                </p>
              )}
              {collectedData.personalInfo.email && (
                <p>
                  <strong>Email:</strong> {collectedData.personalInfo.email}
                </p>
              )}
              {collectedData.jobTarget && (
                <p>
                  <strong>Target Role:</strong> {collectedData.jobTarget}
                </p>
              )}
              {collectedData.skills.length > 0 && (
                <p>
                  <strong>Skills:</strong>{" "}
                  {collectedData.skills.slice(0, 5).join(", ")}
                  {collectedData.skills.length > 5 ? "..." : ""}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeChatbot;
