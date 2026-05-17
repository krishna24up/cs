import { useState } from "react";
import axios from "axios";

function AIShortlist() {

    const [aiResponse, setAIResponse] = useState("");

    const handleAI = async () => {

        try {

            const response = await axios.post(

                "https://cs-nlac.onrender.com/api/ai/shortlist"

            );

            const message =

                response.data.choices[0].message.content;

            setAIResponse(message);

        }
        catch (error) {

            console.log(error);

            alert("AI Shortlisting Failed");

        }

    };

    return (

        <div>

            <h2>AI Candidate Ranking</h2>

            <button onClick={handleAI}>

                AI Shortlist

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