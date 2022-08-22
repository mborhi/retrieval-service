import { NextFunction, Request, Response } from 'express';
import fetch from 'node-fetch';
import { requireUser } from '../../src/utils/playlist/middleware';
jest.mock('node-fetch');
const { Response } = jest.requireActual('node-fetch');
const mockedFetch = fetch as any;

describe("Playlist user middleware", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction = jest.fn();

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            json: jest.fn()
        };
    });

    it("correctly attaches user id to req", async () => {
        mockRequest = {
            headers: {
                access_token: 'mock-access-token'
            }
        };
        mockedFetch.mockReturnValueOnce(Promise.resolve(new Response(
            JSON.stringify({ "id": "mock-id" })
        )));
        await requireUser(mockRequest as Request, mockResponse as Response, nextFunction);
        expect(mockRequest.headers['user_id']).toEqual("mock-id");

    });
});