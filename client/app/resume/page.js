"use client";
import { FileUpload } from "@/components/ui/file-upload";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import React, { useState } from "react";
import { motion } from "motion/react";
import Review from "./Review";

function convertMarkdownToReviewText(markdown) {
  // Step 1: Strip starting ```html and ending ```
  const cleanMarkdown = markdown
    .replace(/^```html\s*/i, '')  // Remove ```html at the beginning
    .replace(/```$/, '')          // Remove ``` at the end
    .trim();

  // Step 2: Convert cleaned markdown to review text
  return cleanMarkdown
    // Headings
    .replace(/^##\s+(.*)$/gm, '$1') // Remove markdown H2 and any emoji
    .replace(/^\*\*(\d+)\. ATS Score: (.*)\*\*/gm, 'ATS Score: $2')
    .replace(/^\*\*2\. Appreciation:\*\*/gm, 'Strengths & Highlights')
    .replace(/^\*\*3\. Fields to Improve:\*\*/gm, 'Areas to Improve')
    .replace(/^\*\*4\. Wrong or Weak Sentences:\*\*/gm, 'Wrong or Weak Sentences')
    .replace(/^\*\*5\. Corrected Versions:\*\*/gm, 'Corrected Versions')
    .replace(/^\*\*6\. Missing Keywords:\*\*/gm, 'Missing Keywords')
    .replace(/^\*\*7\. Final Suggestions:\*\*/gm, 'Final Suggestions')

    // List items with **bolded labels**
    .replace(/^\*\s+\*\*(.*?)\*\:\s*(.*)$/gm, (match, p1, p2) => {
      return `${p1}:\n${p2}`;
    })

    // Remove any remaining bold syntax
    .replace(/\*\*(.*?)\*\*/g, '$1')

    // Normalize spacing
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const Page = () => {
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({
    role: "",
    experience: "",
    skills: "",
    industry: "",
  });
  const [reviewString, setReviewString] = useState(null);
  const [loading, setloading] = useState(false);

  const handleFileUpload = (newFiles) => {
    if (newFiles.length > 1) {
      alert("Please upload only one file!");
      return;
    }
    setFiles(newFiles);
    console.log("Files here =", newFiles);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (files.length !== 1) {
      alert("Please upload exactly one resume file.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", files[0]); // Matches: --form 'resume=@"/path"'
    formData.append("role", form.role); // --form 'role="MERN Stack Developer"'
    formData.append("experience", form.experience); // --form 'experience="Entry Level"'
    formData.append("skills", form.skills); // --form 'skills="Reactjs Nodejs Express MongoDB, Mysql"'
    formData.append("industry", form.industry); // --form 'industry="Software Developer"'

    try {
      setloading(true);
      const response = await fetch("https://airesumereview.onrender.com/review-resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Something went wrong!");
      }

      const result = await response.json();
      console.log("✅ Server Response:", result);
      const reviewString = convertMarkdownToReviewText(result?.atsReview);
      setReviewString(reviewString);

      // Optional: Show response on UI
      alert("🎯 ATS Review Completed! Check console for full result.");
      setloading(false);
    } catch (error) {
      console.error("❌ Upload error:", error.message);
      alert("Something went wrong. Please try again.");
      setloading(false);
    }
  };

  return (
    <HeroHighlight>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: [20, -5, 0] }}
        transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
        className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-neutral-700 dark:text-white leading-snug text-center px-4 max-w-3xl mx-auto"
      >
        Share Your Resume and Get an Instant{" "}
        <Highlight className="text-black dark:text-white">
          ATS Score 📊⚡
        </Highlight>
      </motion.h1>
      {reviewString ? (
        <div className="flex flex-col justify-center items-center">
          <Review reviewString={reviewString} />

          <div onClick={()=>setReviewString(null)} className="p-[2px] mt-10 sm:p-[3px] relative inline-block cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-800 rounded-lg" />
            <div className="px-6 sm:px-8 py-2 bg-black rounded-[6px] relative group transition duration-200 text-white hover:bg-transparent text-sm sm:text-base">
              Re-upload Resume
            </div>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-3xl sm:mx-4 mx-auto mt-10 space-y-6 bg-white dark:bg-black border border-dashed border-neutral-300 dark:border-neutral-800 rounded-lg p-4 sm:p-6"
        >
          {/* Inputs in one column on small screens, two on medium and up */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="role"
              placeholder="Desired Role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-900 text-black dark:text-white"
            />
            <input
              type="text"
              name="experience"
              placeholder="Years of Experience"
              value={form.experience}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-900 text-black dark:text-white"
            />
            <input
              type="text"
              name="skills"
              placeholder="Key Skills (comma-separated)"
              value={form.skills}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-900 text-black dark:text-white"
            />
            <input
              type="text"
              name="industry"
              placeholder="Industry"
              value={form.industry}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-900 text-black dark:text-white"
            />
          </div>

          {/* File Upload */}
          <div className="w-full flex justify-center items-center">
            <FileUpload onChange={handleFileUpload} />
          </div>

          {/* Submit Button */}
          <div className="text-center pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm sm:text-base"
            >
              {loading ? "Waiting..." : "Submit Resume for Review"}
            </button>
          </div>
        </form>
      )}
    </HeroHighlight>
  );
};

export default Page;
