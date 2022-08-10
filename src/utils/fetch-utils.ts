import { Response } from "node-fetch";

export const checkFetch = (response: Response): (Error | Response) => {
    if (response.type === "error") {
        console.error(response);
        throw new Error("error fetching");
    }
    return response;
}