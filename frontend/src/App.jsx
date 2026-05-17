import { useState } from "react";

import CandidateForm from "./components/CandidateForm";
import JobForm from "./components/JobForm";
import CandidateList from "./components/CandidateList";
import AIShortlist from "./components/AIShortlist";

import "./App.css";

function App() {

    const [results, setResults] = useState([]);
    const [jobRequirement, setJobRequirement] = useState({
        requiredSkills: [],
        minExperience: 0
    });

    return (

        <div className="container">

            <h1>
                Candidate Shortlisting System
            </h1>

            <CandidateForm />

            <hr />

            <JobForm
                setResults={setResults}
                setJobRequirement={setJobRequirement}
            />

            <hr />

            <CandidateList results={results} />

            <hr />

            <AIShortlist jobRequirement={jobRequirement} />

        </div>

    );

}

export default App;
