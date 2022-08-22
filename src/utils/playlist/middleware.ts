import fetch from 'node-fetch';
import { NextFunction, Request, Response } from 'express';
import endpointsConfig from '../../../endpoints.config';
import { dataIsError } from '../fetch-utils';

export const requireUser = async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.headers.access_token as string;
    // get user id
    const user_id = await getUserId(access_token);
    if (dataIsError(user_id)) return res.json(user_id);
    req.headers['user_id'] = user_id;
    next();
}

const baseUrl = endpointsConfig.SpotifyAPIBaseURL;

const getUserId = async (token: string) => {
    const url = baseUrl + '/me';
    const response = await fetch(url, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    });
    const data: SpotifyApi.CurrentUsersProfileResponse = await response.json();
    if (dataIsError(data)) return data;
    try {
        const user_id = data.id;
        return user_id;
    } catch (error) {
        console.error(error);
        throw error;
    }
}