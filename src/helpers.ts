import axios from "axios";

export const getJoke = async () => {
    const config = {
        headers: {
            Accept: "application/json",
        }
    };

    try {
        const response = await axios.get("https://icanhazdadjoke.com", config);
        return response.data.joke;
    } catch (error) {
        console.error(error);
    }
};