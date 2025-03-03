"use client"

import { useState } from "react";

// Define the Candidate interface matching the API response
interface Candidate {
  name: string;
  email: string;
  linkedin: string;
  score: number;
  feedback: string;
}

export default function Search() {
  const [jobDescription, setJobDescription] = useState("");
  const [results, setResults] = useState<Candidate[]>([]); // Replace any[] with Candidate[]

  const handleSearch = async () => {
    const response = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobDescription }),
    });
    const data = await response.json();
    setResults(data);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-2xl mb-6">Search Candidates</h1>
      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        className="w-full max-w-lg p-2 border mb-4"
        placeholder="Enter job description..."
      />
      <button onClick={handleSearch} className="bg-blue-500 text-white p-2 rounded">Search</button>
      <div className="mt-6">
        {results.map((candidate, index) => (
          <div key={index} className="border p-4 mb-4">
            <h2>{candidate.name}</h2>
            <p>Email: {candidate.email}</p>
            <p>LinkedIn: {candidate.linkedin}</p>
            <p>Score: {candidate.score}</p>
            <p>Feedback: {candidate.feedback}</p>
          </div>
        ))}
      </div>
    </main>
  );
}