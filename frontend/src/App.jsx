import { useState } from "react";

import CandidateForm from "./components/CandidateForm";
import JobForm from "./components/JobForm";
import CandidateList from "./components/CandidateList";
import AIShortlist from "./components/AIShortlist";

import "./App.css";

function App() {

    const [results, setResults] = useState([]);

    return (

        <div className="container">

            <h1>
                Candidate Shortlisting System
            </h1>

            <CandidateForm />

            <hr />

            <JobForm setResults={setResults} />

            <hr />

            <CandidateList results={results} />

            <hr />

            <AIShortlist />

        </div>

    );

}

export default App;