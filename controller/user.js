import axios from "axios";

export const getUser = async (req, res) => {
    try {
        const response = await axios.get("https://jsonplaceholder.typicode.com/users");
        res.send(response.data);
    } catch (error) {
        res.status(500).send(error.message);
    }
};