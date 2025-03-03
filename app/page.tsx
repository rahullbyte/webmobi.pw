// app/page.tsx (ensure this matches)

"use client"

import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    linkedin: "",
    resume: null as File | null,
    skills: "",
    experience: "",
  });
  const [submissionStatus, setSubmissionStatus] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, resume: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionStatus("Submitting...");

    const form = new FormData();
    form.append("name", formData.name);
    form.append("email", formData.email);
    form.append("linkedin", formData.linkedin);
    if (formData.resume) form.append("resume", formData.resume);
    form.append("skills", formData.skills);
    form.append("experience", formData.experience);

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        body: form,
      });
      const result = await response.json();
      setSubmissionStatus(result.message);
    } catch (error) {
      setSubmissionStatus("Error submitting form.");
      console.error(error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-2xl mb-6">Candidate Application Form</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-lg">
        <div className="mb-4">
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2 border" required />
        </div>
        <div className="mb-4">
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-2 border" required />
        </div>
        <div className="mb-4">
          <label>LinkedIn URL:</label>
          <input type="url" name="linkedin" value={formData.linkedin} onChange={handleInputChange} className="w-full p-2 border" required />
        </div>
        <div className="mb-4">
          <label>Resume (PDF):</label>
          <input type="file" name="resume" accept=".pdf" onChange={handleFileChange} className="w-full p-2" />
        </div>
        <div className="mb-4">
          <label>Skills:</label>
          <textarea name="skills" value={formData.skills} onChange={handleInputChange} className="w-full p-2 border" required />
        </div>
        <div className="mb-4">
          <label>Experience:</label>
          <textarea name="experience" value={formData.experience} onChange={handleInputChange} className="w-full p-2 border" required />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Submit</button>
      </form>
      {submissionStatus && <p className="mt-4">{submissionStatus}</p>}
    </main>
  );
}