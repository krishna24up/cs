import { useState } from "react";
import api from "../api";

function AIShortlist({ jobRequirement }) {

    const [aiResponse, setAIResponse] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleAI = async () => {

        try {

            setIsLoading(true);
            setAIResponse("");

            const response = await api.post(

                "/api/ai/shortlist",

                jobRequirement

            );

            const message =

                response.data.result || "No AI recommendation returned.";

            setAIResponse(message);

        }
        catch (error) {

            console.log(error);

            const message =
                error.response?.data?.message ||
                error.response?.data?.error?.message ||
                "AI Shortlisting Failed";

            alert(message);

        }
        finally {

            setIsLoading(false);

        }

    };

    return (

        <div>

            <h2>AI Candidate Ranking</h2>

            <button onClick={handleAI} disabled={isLoading}>

                {isLoading ? "Shortlisting..." : "AI Shortlist"}

            </button>

            <br /><br />

            <textarea
                rows="15"
                cols="100"
                value={aiResponse}
                readOnly
            />

        </div>

    );

}

export default AIShortlist;
