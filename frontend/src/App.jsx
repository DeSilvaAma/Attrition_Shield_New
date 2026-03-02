import React, { useState } from "react";
import axios from "axios";

function App() {
  const [formData, setFormData] = useState({
    job: "Software Engineer",
    rating: 3,
    career: 3,
    comp: 3,
    culture: 3,
    diversity: 3,
    senior: 3,
    wlb: 3,
    recommend: "v",
    ceo: "v",
    outlook: "v",
    worked_years: "more than 1 year",
    title: "",
    pros: "",
    cons: "",
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- UI labels matching backend
  const ratingFields = [
    { id: "rating", label: "Overall Rating" },
    { id: "career", label: "Career Opportunities" },
    { id: "comp", label: "Compensation & Benefits" },
    { id: "culture", label: "Culture & Values" },
    { id: "diversity", label: "Diversity & Inclusion" },
    { id: "senior", label: "Senior Management" },
    { id: "wlb", label: "Work/Life Balance" },
  ];

  const opinionOptions = [
    { value: "v", label: "Positive" },
    { value: "r", label: "Mild" },
    { value: "x", label: "Negative" },
    { value: "o", label: "No opinion" },
  ];

  const workedYearOptions = [
    "less than 1 year",
    "more than 1 year",
    "more than 3 year",
    "more than 5 year",
    "more than 8 year",
    "more than 10 year",
  ];

  const jobRoles = [
    "Software Engineer",
    "Senior Software Engineer",
    "Director",
    "Manager",
    "Consultant",
    "Data & Analyst",
    "Sales",
    "Crew Member",
  ];

  // --- Submit prediction
  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/predict", formData);
      setPrediction(res.data);
    } catch (err) {
      console.error(err);
      alert("Backend error! Make sure FastAPI server is running.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <h1 className="text-3xl font-bold mb-6">Attrition Shield - Employee Attrition Prediction</h1>

      <form onSubmit={handlePredict} className="space-y-6 bg-white p-6 rounded-xl shadow">
        {/* Job Role & Tenure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-semibold">Job Role</label>
            <select
              value={formData.job}
              onChange={(e) => setFormData({ ...formData, job: e.target.value })}
              className="w-full p-2 border rounded"
            >
              {jobRoles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-semibold">Worked Years</label>
            <select
              value={formData.worked_years}
              onChange={(e) => setFormData({ ...formData, worked_years: e.target.value })}
              className="w-full p-2 border rounded"
            >
              {workedYearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Rating Sliders */}
        <div>
          <h2 className="font-bold mb-2">Experience Ratings (1–5)</h2>
          {ratingFields.map((f) => (
            <div key={f.id} className="mb-4">
              <label className="block mb-1">{f.label}: {formData[f.id]}</label>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={formData[f.id]}
                onChange={(e) =>
                  setFormData({ ...formData, [f.id]: Number(e.target.value) })
                }
                className="w-full"
              />
            </div>
          ))}
        </div>

        {/* Sentiment Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: "recommend", label: "Recommendation" },
            { id: "ceo", label: "CEO Approval" },
            { id: "outlook", label: "Business Outlook" },
          ].map((f) => (
            <div key={f.id}>
              <label className="block mb-1 font-semibold">{f.label}</label>
              <select
                value={formData[f.id]}
                onChange={(e) => setFormData({ ...formData, [f.id]: e.target.value })}
                className="w-full p-2 border rounded"
              >
                {opinionOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Feedback text */}
        <div>
          <label className="block mb-1 font-semibold">Summary Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <label className="block mb-1 font-semibold">Pros Feedback</label>
          <textarea
            value={formData.pros}
            onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <label className="block mb-1 font-semibold">Cons Feedback</label>
          <textarea
            value={formData.cons}
            onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white p-3 rounded font-bold"
        >
          {loading ? "Predicting..." : "Run Prediction"}
        </button>
      </form>

      {/* Prediction Results */}
      {prediction && (
        <div className="mt-6 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-2">Prediction</h2>
          <p>Stay Probability: <strong>{(prediction.stay_probability*100).toFixed(1)}%</strong></p>
          <p>Attrition Risk: <strong>{(prediction.attrition_risk*100).toFixed(1)}%</strong></p>

          <h3 className="mt-4 font-bold">Feature Contributions</h3>
          <ul className="list-disc list-inside">
            {prediction.impact_scores.map((f) => (
              <li key={f.feature}>
                {f.feature}: {f.impact}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;


// import React, { useState } from "react";
// import axios from "axios";
// import {
//   LayoutDashboard,
//   Send,
//   AlertCircle,
//   CheckCircle2,
// } from "lucide-react";

// function App() {
//   // ---------------------------
//   // FORM STATE
//   // ---------------------------
//   const [formData, setFormData] = useState({
//     job: "Software Engineer",
//     rating: 3,
//     career: 3,
//     comp: 3,
//     culture: 3,
//     senior: 3,
//     wlb: 3,
//     diversity: 3,

//     // MUST MATCH FASTAPI EXACTLY:
//     recommend: "v",
//     ceo: "v",
//     outlook: "v",

//     // Backend requires STRING, not number
//     worked_years: "more than 1 year",

//     title: "",
//     pros: "",
//     cons: "",
//   });

//   const [prediction, setPrediction] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // ---------------------------
//   // DROPDOWNS
//   // ---------------------------
//   const opinionOptions = [
//     { value: "v", label: "Positive" },
//     { value: "r", label: "Mild" },
//     { value: "x", label: "Negative" },
//     { value: "o", label: "No opinion" },
//   ];

//   const workedYearOptions = [
//     "less than 1 year",
//     "more than 1 year",
//     "more than 3 year",
//     "more than 5 year",
//     "more than 8 year",
//     "more than 10 year",
//   ];

//   const jobRoles = [
//     "Software Engineer",
//     "Senior Software Engineer",
//     "Director",
//     "Manager",
//     "Consultant",
//     "Data & Analyst",
//     "Sales",
//     "Crew Member",
//   ];

//   const ratingFields = [
//     { id: "career", label: "Career Opportunities" },
//     { id: "comp", label: "Compensation & Benefits" },
//     { id: "senior", label: "Senior Management" },
//     { id: "wlb", label: "Work/Life Balance" },
//     { id: "culture", label: "Culture & Values" },
//     { id: "diversity", label: "Diversity & Inclusion" },
//     { id: "rating", label: "Overall Rating" },
//   ];

//   // ---------------------------
//   // SUBMIT HANDLER
//   // ---------------------------
//   const handlePredict = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const response = await axios.post("http://127.0.0.1:8000/predict", formData);
//       setPrediction(response.data);
//     } catch (err) {
//       console.error(err);
//       alert("Error connecting to FastAPI. Start backend first!");
//     }

//     setLoading(false);
//   };

//   // ---------------------------
//   // UI RENDER
//   // ---------------------------
//   return (
//     <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
//       {/* HEADER */}
//       <header className="max-w-6xl mx-auto mb-10 flex items-center gap-4">
//         <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-xl shadow-indigo-100">
//           <LayoutDashboard size={32} />
//         </div>
//         <div>
//           <h1 className="text-3xl font-black text-slate-800 tracking-tight">
//             Attrition Shield AI
//           </h1>
//           <p className="text-slate-500 font-medium italic">
//             Employee Retention Prediction System
//           </p>
//         </div>
//       </header>

//       {/* MAIN GRID */}
//       <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
//         {/* FORM SECTION */}
//         <form
//           onSubmit={handlePredict}
//           className="lg:col-span-3 space-y-8 bg-white p-8 rounded-3xl shadow-sm border border-slate-200"
//         >
//           {/* JOB ROLE + TENURE */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-2xl">
//             {/* Job Role */}
//             <div className="space-y-2">
//               <label className="text-sm font-bold text-slate-700">
//                 Current Job Role
//               </label>
//               <select
//                 className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
//                 value={formData.job}
//                 onChange={(e) =>
//                   setFormData({ ...formData, job: e.target.value })
//                 }
//               >
//                 {jobRoles.map((role) => (
//                   <option key={role} value={role}>
//                     {role}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Worked Years */}
//             <div className="space-y-2">
//               <label className="text-sm font-bold text-slate-700">
//                 Tenure (Worked Years)
//               </label>
//               <select
//                 className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
//                 value={formData.worked_years}
//                 onChange={(e) =>
//                   setFormData({ ...formData, worked_years: e.target.value })
//                 }
//               >
//                 {workedYearOptions.map((label) => (
//                   <option key={label} value={label}>
//                     {label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* RATING SLIDERS */}
//           <div className="space-y-4">
//             <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-b pb-2">
//               Experience Ratings (Scale 1–5)
//             </h3>
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//               {ratingFields.map((field) => (
//                 <div
//                   key={field.id}
//                   className="flex flex-col gap-2 p-3 bg-white border rounded-xl hover:border-indigo-200 transition"
//                 >
//                   <label className="text-xs font-bold text-slate-600">
//                     {field.label}
//                   </label>
//                   <input
//                     type="range"
//                     min="1"
//                     max="5"
//                     step="1"
//                     className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
//                     value={formData[field.id]}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         [field.id]: Number(e.target.value),
//                       })
//                     }
//                   />
//                   <div className="flex justify-between text-[10px] font-bold text-slate-400">
//                     <span>1 (Poor)</span>
//                     <span className="text-indigo-600 text-sm">
//                       {formData[field.id]}
//                     </span>
//                     <span>5 (Great)</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* SENTIMENT DROPDOWNS */}
//           <div className="space-y-4">
//             <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-b pb-2">
//               Sentiment Indicators
//             </h3>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//               {[
//                 { id: "recommend", label: "Recommendation" },
//                 { id: "ceo", label: "CEO Approval" },
//                 { id: "outlook", label: "Business Outlook" },
//               ].map((field) => (
//                 <div key={field.id} className="space-y-2">
//                   <label className="text-sm font-bold text-slate-700">
//                     {field.label}
//                   </label>
//                   <select
//                     className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
//                     value={formData[field.id]}
//                     onChange={(e) =>
//                       setFormData({ ...formData, [field.id]: e.target.value })
//                     }
//                   >
//                     {opinionOptions.map((op) => (
//                       <option key={op.value} value={op.value}>
//                         {op.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* FEEDBACK TEXT INPUTS */}
//           <div className="space-y-4">
//             <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-b pb-2">
//               Qualitative Feedback
//             </h3>

//             <input
//               type="text"
//               placeholder="Summary Title"
//               className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
//               value={formData.title}
//               onChange={(e) =>
//                 setFormData({ ...formData, title: e.target.value })
//               }
//             />

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <textarea
//                 placeholder="Pros feedback..."
//                 rows="3"
//                 className="w-full p-3 border border-slate-200 rounded-xl bg-green-50/30 focus:ring-2 focus:ring-green-500 outline-none"
//                 value={formData.pros}
//                 onChange={(e) =>
//                   setFormData({ ...formData, pros: e.target.value })
//                 }
//               />
//               <textarea
//                 placeholder="Cons feedback..."
//                 rows="3"
//                 className="w-full p-3 border border-slate-200 rounded-xl bg-red-50/30 focus:ring-2 focus:ring-red-500 outline-none"
//                 value={formData.cons}
//                 onChange={(e) =>
//                   setFormData({ ...formData, cons: e.target.value })
//                 }
//               />
//             </div>
//           </div>

//           {/* SUBMIT BUTTON */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-[0.99] disabled:opacity-50"
//           >
//             {loading ? (
//               "Calculating Risk..."
//             ) : (
//               <>
//                 <Send size={24} /> Run Analysis
//               </>
//             )}
//           </button>
//         </form>

//         {/* SIDEBAR RESULTS */}
//         <div className="lg:col-span-1">
//           <div
//             className={`sticky top-8 p-8 rounded-3xl shadow-2xl transition-all duration-700 ${
//               prediction
//                 ? "bg-white border-2 border-indigo-500"
//                 : "bg-slate-200 border-2 border-dashed border-slate-300"
//             }`}
//           >
//             <h2 className="text-xl font-black mb-8 flex items-center gap-2">
//               {prediction ? (
//                 <CheckCircle2 className="text-green-500" />
//               ) : (
//                 <AlertCircle className="text-slate-400" />
//               )}
//               AI Insights
//             </h2>

//             {!prediction ? (
//               <div className="text-center text-slate-500 py-12">
//                 <p className="font-medium">
//                   Please enter details to generate the retention risk.
//                 </p>
//               </div>
//             ) : (
//               <div className="text-center space-y-6">
//                 <div className="text-6xl font-black text-indigo-600">
//                   {Math.round(prediction.stay_probability * 100)}%
//                 </div>
//                 <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">
//                   Stay Probability
//                 </div>
//                 <div
//                   className={`p-4 rounded-2xl font-bold text-sm ${
//                     prediction.stay_probability > 0.5
//                       ? "bg-green-100 text-green-700"
//                       : "bg-red-100 text-red-700"
//                   }`}
//                 >
//                   {prediction.stay_probability > 0.5
//                     ? "RETAINED: Low Risk"
//                     : "WARNING: High Attrition Risk"}
//                 </div>
//                 <p className="text-xs text-slate-400 leading-relaxed">
//                   Prediction combines feedback sentiment with historical
//                   employee behavior patterns.
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// export default App;


// import React, { useState } from 'react';
// import axios from 'axios';
// import { LayoutDashboard, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

// function App() {
//   const [formData, setFormData] = useState({
//     job: "Software Engineer",
//     rating: 3, career: 3, comp: 3, culture: 3, senior: 3, wlb: 3, diversity: 3,
//     recommend: "v", ceo: "v", outlook: "v",
//     years_label: "more than 1 year",
//     title: "", pros: "", cons: ""
//   });

//   const [prediction, setPrediction] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // Mappings based on your requirements
//   const opinionMap = { "v": "Positive", "r": "Mild", "x": "Negative", "o": "No opinion" };
//   const yearsMap = {
//     "less than 1 year": 0.5,
//     "more than 1 year": 2,
//     "more than 3 year": 4,
//     "more than 5 year": 6,
//     "more than 8 year": 9,
//     "more than 10 year": 11
//   };

//   const jobRoles = [
//     "Software Engineer", "Senior Software Engineer", "Director", 
//     "Manager", "Consultant", "Data & Analyst", "Sales", "Crew Member"
//   ];

//   const ratingFields = [
//     { id: 'career', label: 'Career Opportunities' },
//     { id: 'comp', label: 'Compensation and Benefits' },
//     { id: 'senior', label: 'Senior Management' },
//     { id: 'wlb', label: 'Work/Life Balance' },
//     { id: 'culture', label: 'Culture & Values' },
//     { id: 'diversity', label: 'Diversity & Inclusion' },
//     { id: 'rating', label: 'Overall Rating' }
//   ];

//   const handlePredict = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     const payload = {
//       ...formData,
//       worked_years: yearsMap[formData.years_label]
//     };
//     delete payload.years_label;

//     try {
//       const response = await axios.post('http://127.0.0.1:8000/predict', payload);
//       setPrediction(response.data);
//     } catch (err) {
//       console.error(err);
//       alert("Backend Connection Error. Make sure your FastAPI server is running!");
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
//       <header className="max-w-6xl mx-auto mb-10 flex items-center gap-4">
//         <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-xl shadow-indigo-100">
//           <LayoutDashboard size={32} />
//         </div>
//         <div>
//           <h1 className="text-3xl font-black text-slate-800 tracking-tight">Attrition Shield AI</h1>
//           <p className="text-slate-500 font-medium italic">Employee Retention Prediction System</p>
//         </div>
//       </header>

//       <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
//         <form onSubmit={handlePredict} className="lg:col-span-3 space-y-8 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          
//           {/* 1. Basic Info & Experience */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-2xl">
//             <div className="space-y-2">
//               <label className="text-sm font-bold text-slate-700">Current Job Role</label>
//               <select className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
//                 value={formData.job} onChange={e => setFormData({...formData, job: e.target.value})}>
//                 {jobRoles.map(role => <option key={role} value={role}>{role}</option>)}
//               </select>
//             </div>
//             <div className="space-y-2">
//               <label className="text-sm font-bold text-slate-700">Tenure (Worked Years)</label>
//               <select className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
//                 value={formData.years_label} onChange={e => setFormData({...formData, years_label: e.target.value})}>
//                 {Object.keys(yearsMap).map(label => <option key={label} value={label}>{label}</option>)}
//               </select>
//             </div>
//           </div>

//           {/* 2. Rating Scales (1-5) */}
//           <div className="space-y-4">
//             <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-b pb-2">Experience Ratings (Scale 1-5)</h3>
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//               {ratingFields.map(field => (
//                 <div key={field.id} className="flex flex-col gap-2 p-3 bg-white border rounded-xl hover:border-indigo-200 transition">
//                   <label className="text-xs font-bold text-slate-600">{field.label}</label>
//                   <input type="range" min="1" max="5" step="1" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
//                     value={formData[field.id]} onChange={e => setFormData({...formData, [field.id]: Number(e.target.value)})} />
//                   <div className="flex justify-between text-[10px] font-bold text-slate-400">
//                     <span>1 (Poor)</span>
//                     <span className="text-indigo-600 text-sm">{formData[field.id]}</span>
//                     <span>5 (Great)</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* 3. Sentiment Dropdowns */}
//           <div className="space-y-4">
//             <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-b pb-2">Sentiment Indicators</h3>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//               {[
//                 { id: 'recommend', label: 'Recommendation' },
//                 { id: 'ceo', label: 'CEO Approval' },
//                 { id: 'outlook', label: 'Business Outlook' }
//               ].map(field => (
//                 <div key={field.id} className="space-y-2">
//                   <label className="text-sm font-bold text-slate-700">{field.label}</label>
//                   <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
//                     value={formData[field.id]} onChange={e => setFormData({...formData, [field.id]: e.target.value})}>
//                     {Object.entries(opinionMap).map(([key, val]) => <option key={key} value={key}>{val}</option>)}
//                   </select>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* 4. Qualitative Feedback */}
//           <div className="space-y-4">
//             <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-b pb-2">Qualitative Feedback</h3>
//             <div className="space-y-4">
//               <input type="text" placeholder="Summary Title (e.g., 'Great workplace but slow growth')" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
//                 value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <textarea placeholder="Pros feedback..." rows="3" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-green-50/30" 
//                   value={formData.pros} onChange={e => setFormData({...formData, pros: e.target.value})} />
//                 <textarea placeholder="Cons feedback..." rows="3" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none bg-red-50/30" 
//                   value={formData.cons} onChange={e => setFormData({...formData, cons: e.target.value})} />
//               </div>
//             </div>
//           </div>

//           <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-[0.99] disabled:opacity-50">
//             {loading ? "Calculating Risk..." : <><Send size={24}/> Run Analysis</>}
//           </button>
//         </form>

//         {/* Sidebar Results */}
//         <div className="lg:col-span-1">
//           <div className={`sticky top-8 p-8 rounded-3xl shadow-2xl transition-all duration-700 ${prediction ? 'bg-white border-2 border-indigo-500' : 'bg-slate-200 border-2 border-dashed border-slate-300'}`}>
//             <h2 className="text-xl font-black mb-8 flex items-center gap-2">
//               {prediction ? <CheckCircle2 className="text-green-500" /> : <AlertCircle className="text-slate-400" />}
//               AI Insights
//             </h2>
            
//             {prediction ? (
//               <div className="text-center space-y-6">
//                 <div className="text-6xl font-black text-indigo-600">
//                   {Math.round(prediction.stay_probability * 100)}%
//                 </div>
//                 <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">
//                   Stay Probability
//                 </div>
//                 <div className={`p-4 rounded-2xl font-bold text-sm ${prediction.stay_probability > 0.5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
//                   {prediction.stay_probability > 0.5 ? "RETAINED: Low Risk" : "WARNING: High Attrition Risk"}
//                 </div>
//                 <p className="text-xs text-slate-400 leading-relaxed">
//                   Prediction based on sentiment analysis of feedback and historical tenure patterns.
//                 </p>
//               </div>
//             ) : (
//               <div className="text-center text-slate-500 py-12">
//                 <p className="font-medium">Please enter employee details to generate the retention risk score.</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// export default App;


















// import React, { useState } from 'react';
// import axios from 'axios';
// import { LayoutDashboard, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

// function App() {
//   const [formData, setFormData] = useState({
//     job: "Software Engineer",
//     rating: 3, career: 3, comp: 3, culture: 3, senior: 3, wlb: 3, diversity: 3,
//     recommend: "v", ceo: "v", outlook: "v",
//     years_label: "more than 1 year",
//     title: "", pros: "", cons: ""
//   });

//   const [prediction, setPrediction] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // Mappings for your Backend
//   const opinionMap = { "v": "Positive", "r": "Mild", "x": "Negative", "o": "No opinion" };
//   const yearsMap = {
//     "less than 1 year": 0.5,
//     "more than 1 year": 2,
//     "more than 3 year": 4,
//     "more than 5 year": 6,
//     "more than 8 year": 9,
//     "more than 10 year": 11
//   };

//   const handlePredict = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     // Construct the exact JSON your FastAPI model expects
//     const payload = {
//       ...formData,
//       worked_years: yearsMap[formData.years_label] // Convert label to number for model
//     };
//     delete payload.years_label; // Clean up the label

//     try {
//       const response = await axios.post('http://127.0.0.1:8000/predict', payload);
//       setPrediction(response.data);
//     } catch (err) {
//       console.error(err);
//       alert("Backend Connection Error. Is FastAPI running?");
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6 font-sans">
//       <header className="max-w-5xl mx-auto mb-10 flex items-center gap-4">
//         <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-200">
//           <LayoutDashboard size={32} />
//         </div>
//         <div>
//           <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Attrition Shield AI</h1>
//           <p className="text-slate-500 font-medium">Employee Retention Risk Predictor</p>
//         </div>
//       </header>

//       <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
//         <form onSubmit={handlePredict} className="lg:col-span-2 space-y-8 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          
//           {/* Section 1: Basic Info */}
//           <section className="space-y-4">
//             <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Basic Information</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-1">
//                 <label className="text-sm font-semibold text-slate-700">Job Role</label>
//                 <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
//                   value={formData.job} onChange={e => setFormData({...formData, job: e.target.value})}>
//                   <option>Software Engineer</option>
//                   <option>Data Scientist</option>
//                   <option>Project Manager</option>
//                   <option>HR Specialist</option>
//                 </select>
//               </div>
//               <div className="space-y-1">
//                 <label className="text-sm font-semibold text-slate-700">Experience Duration</label>
//                 <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
//                   value={formData.years_label} onChange={e => setFormData({...formData, years_label: e.target.value})}>
//                   {Object.keys(yearsMap).map(label => <option key={label}>{label}</option>)}
//                 </select>
//               </div>
//             </div>
//           </section>

//           {/* Section 2: Ratings (1-5) */}
//           <section className="space-y-4">
//             <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Company Ratings (1-5)</h3>
//             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//               {['career', 'comp', 'culture', 'senior', 'wlb', 'diversity', 'rating'].map(field => (
//                 <div key={field} className="space-y-1">
//                   <label className="text-xs font-bold text-slate-500 uppercase">{field.replace('_', ' ')}</label>
//                   <input type="number" min="1" max="5" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold"
//                     value={formData[field]} onChange={e => setFormData({...formData, [field]: Number(e.target.value)})} />
//                 </div>
//               ))}
//             </div>
//           </section>

//           {/* Section 3: Sentiment Dropdowns */}
//           <section className="space-y-4">
//             <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Employee Sentiment</h3>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//               {['recommend', 'ceo', 'outlook'].map(field => (
//                 <div key={field} className="space-y-1">
//                   <label className="text-sm font-semibold text-slate-700 capitalize">{field} Approval</label>
//                   <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
//                     value={formData[field]} onChange={e => setFormData({...formData, [field]: e.target.value})}>
//                     {Object.entries(opinionMap).map(([key, val]) => <option key={key} value={key}>{val}</option>)}
//                   </select>
//                 </div>
//               ))}
//             </div>
//           </section>

//           {/* Section 4: Feedback */}
//           <section className="space-y-4">
//             <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Detailed Feedback</h3>
//             <input type="text" placeholder="Review Title" className="w-full p-3 border rounded-xl" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
//             <textarea placeholder="Pros..." rows="2" className="w-full p-3 border rounded-xl" value={formData.pros} onChange={e => setFormData({...formData, pros: e.target.value})} />
//             <textarea placeholder="Cons..." rows="2" className="w-full p-3 border rounded-xl" value={formData.cons} onChange={e => setFormData({...formData, cons: e.target.value})} />
//           </section>

//           <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]">
//             {loading ? <span className="animate-pulse">Analyzing...</span> : <><Send size={20}/> Run Retention Analysis</>}
//           </button>
//         </form>

//         {/* Prediction Results Card */}
//         <aside className="space-y-6">
//           <div className={`p-8 rounded-3xl shadow-xl border transition-all duration-500 ${prediction ? 'bg-white border-white' : 'bg-slate-100 border-dashed border-slate-300'}`}>
//             <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
//               {prediction ? <CheckCircle2 className="text-green-500" /> : <AlertCircle className="text-slate-400" />}
//               Prediction Result
//             </h2>
            
//             {prediction ? (
//               <div className="text-center animate-in fade-in zoom-in duration-500">
//                 <div className="relative inline-block mb-4">
//                   <svg className="w-32 h-32 transform -rotate-90">
//                     <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
//                     <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={364.4} 
//                       strokeDashoffset={364.4 - (364.4 * prediction.stay_probability)} 
//                       className="text-indigo-600 transition-all duration-1000 ease-out" />
//                   </svg>
//                   <div className="absolute inset-0 flex items-center justify-center text-2xl font-black italic">
//                     {Math.round(prediction.stay_probability * 100)}%
//                   </div>
//                 </div>
//                 <p className="text-slate-600 font-medium">Confidence in Employee Retention</p>
//                 <div className={`mt-6 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${prediction.stay_probability > 0.5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
//                   {prediction.stay_probability > 0.5 ? "Low Risk" : "High Risk of Attrition"}
//                 </div>
//               </div>
//             ) : (
//               <div className="text-center text-slate-400 py-10">
//                 <p className="text-sm">Complete the form and click analyze to see the AI prediction result.</p>
//               </div>
//             )}
//           </div>
//         </aside>
//       </main>
//     </div>
//   );
// }

// export default App;



// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App
