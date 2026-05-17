import { useState } from "react";
import api from "../api";

function JobForm({ setResults, setJobRequirement }) {

    const [requiredSkills, setRequiredSkills] = useState("");

    const [minExperience, setMinExperience] = useState(0);

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const payload = {

                requiredSkills:
                    requiredSkills
                        .split(",")
                        .map((skill) => skill.trim())
                        .filter(Boolean),

                minExperience: Number(minExperience)

            };

            const response = await api.post("/api/match", payload);

            setResults(response.data);

            setJobRequirement(payload);

        }
        catch (error) {

            console.log(error);

            alert("Error Matching Candidates");

        }

    };

    return (

        <div>

            <h2>Job Requirement</h2>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    placeholder="React,Node.js"
                    value={requiredSkills}
                    onChange={(e) =>
                        setRequiredSkills(e.target.value)
                    }
                />

                <br /><br />

                <input
                    type="number"
                    placeholder="Minimum Experience"
                    value={minExperience}
                    onChange={(e) =>
                        setMinExperience(e.target.value)
                    }
                />

                <br /><br />

                <button type="submit">

                    Match Candidates

                </button>

            </form>

        </div>

    );

}

export default JobForm;
