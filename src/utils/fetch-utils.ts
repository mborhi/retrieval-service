import { Response } from "node-fetch";

/**
 * Determines whether the given response has an error
 * @param response the response to check for errors
 * @returns whether the response has an error
 */
export const responseIsError = (response: Response): boolean => {
    if (!response.ok) {
        return true;
    }
    return false;
}

/**
 * Determines whether the given JSON has an error field (an error)
 * @param data the JSON to check
 * @returns whether the given JSON has an error
 */
export const dataIsError = (data: any): boolean => {
    if (data.error !== undefined) {
        return true;
    }
    return false;
}