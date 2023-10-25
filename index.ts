import { z } from "zod";

enum HTTPMethods {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

const HTTPHeadersContentType = {
  application_json: { "Content-Type": "application/json" },
};

/**
 * @author Bert Van Hecke
 * @description Does a request with extra type safety.
 * @param {string} url the API endpoint
 * @param {RequestInit} config extra configuration options such as HTTP method, body and headers.
 * @param {TResponseSchema} responseSchema the zod schema that will be used to check the response.
 */
async function request<TResponseSchema extends z.Schema>(
  url: string,
  config: RequestInit,
  responseSchema: TResponseSchema
): Promise<z.infer<TResponseSchema>> {
  const abortController = new AbortController();
  const { signal } = abortController;

  try {
    const response = await fetch(url, { ...config, signal });

    if (!response.ok) {
      if (response.status >= 400 && response.status < 500) {
        throw createClientError(`${response.status}: ${response.statusText}`);
      } else if (response.status >= 500) {
        throw createServerError(`${response.status}: ${response.statusText}`);
      }
    }
    return responseSchema.parse(await response.json());
  } catch (error) {
    if (error instanceof Error) {
      handleErrors(error);
    }
    throw error;
  } finally {
    abortController.abort();
  }
}

/**
 * @author Bert Van Hecke
 * @description Does a GET request with extra type safety.
 * @param {string} url the API endpoint.
 * @param {TResponseSchema} responseSchema the zod schema that will be used to check the response.
 */
export async function _get<TResponseSchema extends z.Schema>(
  url: string,
  responseSchema: TResponseSchema,
  apiKey: string
): Promise<z.infer<TResponseSchema>> {
  return request<TResponseSchema>(
    url,
    {
      method: HTTPMethods.GET,
      cache: "no-store",
      headers: { "X-API-KEY": apiKey },
    },
    responseSchema
  );
}

/**
 * @author Bert Van Hecke
 * @description Does a POST request with extra type safety.
 * @param {string} url the API endpoint.
 * @param {TQuerySchema} querySchema the zod schema that will be used to parse the query.
 * @param {z.infer<TQuerySchema>} query the query that will be parsed and sent in the body.
 * @param {TResponseSchema} responseSchema the zod schema that will be used to check the response.
 */
export async function _post<
  TQuerySchema extends z.Schema,
  TResponseSchema extends z.Schema
>(
  url: string,
  querySchema: TQuerySchema,
  query: z.infer<TQuerySchema>,
  responseSchema: TResponseSchema
): Promise<z.infer<TResponseSchema>> {
  return request<TResponseSchema>(
    url,
    {
      method: HTTPMethods.POST,
      body: JSON.stringify(querySchema.parse(query)),
      headers: HTTPHeadersContentType.application_json,
    },
    responseSchema
  );
}

/**
 * @author Bert Van Hecke
 * @description Does a PUT request with extra type safety.
 * @param {string} url the API endpoint.
 * @param {TQuerySchema} querySchema the zod schema that will be used to parse the query.
 * @param {z.infer<TQuerySchema>} query the query that will be parsed and sent in the body.
 * @param {TResponseSchema} responseSchema the zod schema that will be used to check the response.
 */
export async function _put<
  TQuerySchema extends z.Schema,
  TResponseSchema extends z.Schema
>(
  url: string,
  querySchema: TQuerySchema,
  query: z.infer<TQuerySchema>,
  responseSchema: TResponseSchema
): Promise<z.infer<TResponseSchema>> {
  return request<TResponseSchema>(
    url,
    {
      method: HTTPMethods.PUT,
      body: JSON.stringify(querySchema.parse(query)),
      headers: HTTPHeadersContentType.application_json,
    },
    responseSchema
  );
}

/**
 * @author Bert Van Hecke
 * @description Does a PATCH request with extra type safety.
 * @param {string} url the API endpoint.
 * @param {TQuerySchema} querySchema the zod schema that will be used to parse the query.
 * @param {z.infer<TQuerySchema>} query the query that will be parsed and sent in the body.
 * @param {TResponseSchema} responseSchema the zod schema that will be used to check the response.
 */
export async function _patch<
  TQuerySchema extends z.Schema,
  TResponseSchema extends z.Schema
>(
  url: string,
  querySchema: TQuerySchema,
  query: z.infer<TQuerySchema>,
  responseSchema: TResponseSchema
): Promise<z.infer<TResponseSchema>> {
  return request<TResponseSchema>(
    url,
    {
      method: HTTPMethods.PATCH,
      body: JSON.stringify(querySchema.parse(query)),
      headers: HTTPHeadersContentType.application_json,
    },
    responseSchema
  );
}

/**
 * @author Bert Van Hecke
 * @description Does a DELETE request with extra type safety.
 * @param {string} url the API endpoint.
 * @param {TQuerySchema} querySchema the zod schema that will be used to parse the query.
 * @param {z.infer<TQuerySchema>} query the query that will be parsed and sent in the body.
 * @param {TResponseSchema} responseSchema the zod schema that will be used to check the response.
 */
export async function _delete<
  TQuerySchema extends z.Schema,
  TResponseSchema extends z.Schema
>(
  url: string,
  querySchema: TQuerySchema,
  query: z.infer<TQuerySchema>,
  responseSchema: TResponseSchema
): Promise<z.infer<TResponseSchema>> {
  return request<TResponseSchema>(
    url,
    {
      method: HTTPMethods.DELETE,
      body: JSON.stringify(querySchema.parse(query)),
      headers: HTTPHeadersContentType.application_json,
    },
    responseSchema
  );
}

function createNetworkError(message: string): Error {
  const error = new Error(message);
  error.name = "NetworkError";
  return error;
}

function createClientError(message: string): Error {
  const error = new Error(message);
  error.name = "ClientError";
  return error;
}

function createServerError(message: string): Error {
  const error = new Error(message);
  error.name = "ServerError";
  return error;
}

function handleNetworkError(error: Error) {
  console.error("Network error occurred:", error.message, error.cause);
  // Handle network error
}

function handleClientError(error: Error) {
  console.error("Client error occurred:", error.message, error.cause);
  // Handle client error
}

function handleServerError(error: Error) {
  console.error("Server error occurred:", error.message, error.cause);
  // Handle server error
}

function handleAbortError(error: Error) {
  console.error("Request was aborted:", error.message, error.cause);
  // Handle abort error
}

function handleUnexpectedError(error: Error) {
  console.error("An unexpected error occurred:", error.message, error.cause);
  // Handle other errors
}

function handleErrors(error: Error) {
  const errorHandlers: { [key: string]: (error: Error) => void } = {
    AbortError: handleAbortError,
    NetworkError: handleNetworkError,
    ClientError: handleClientError,
    ServerError: handleServerError,
  };

  const errorHandler = errorHandlers[error.name] || handleUnexpectedError;
  errorHandler(error);
}
