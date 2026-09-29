import axios, {
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from "axios";
import { API_CONFIG, AUTH_STORAGE_KEYS, FRONTEND_ROUTES } from "./constants";
import { getStorageItem, removeStorageItems } from "./storage";

export interface ApiSuccessResponse<T> {
    isError: false;
    data: T;
    statusCode: number;
    message: string[];
    metaData?: any;
}

export interface ApiErrorResponse {
    statusCode: number;
    timestamp: string;
    path: string;
    message: string;
}

export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly path: string;
    public readonly timestamp: string;

    constructor(payload: ApiErrorResponse) {
        super(payload.message);
        Object.setPrototypeOf(this, ApiError.prototype);
        this.name = "ApiError";
        this.statusCode = payload.statusCode;
        this.path = payload.path;
        this.timestamp = payload.timestamp;
    }
}

const PUBLIC_ROUTES: string[] = [
    FRONTEND_ROUTES.LANDING,
    FRONTEND_ROUTES.LOGIN,
];

class HttpService {
    private static instance: HttpService;
    private readonly axiosInstance: AxiosInstance;

    private constructor() {
        this.axiosInstance = axios.create({
            baseURL: API_CONFIG.BASE_URL,
            withCredentials: false,
            headers: {
                "Content-Type": "application/json",
            },
        });

        this.attachRequestInterceptor();
        this.attachResponseInterceptor();
    }

    private attachRequestInterceptor(): void {
        this.axiosInstance.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                if (typeof window !== "undefined") {
                    try {
                        const token = getStorageItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN) || process.env.NEXT_PUBLIC_ANALYTICS_API_KEY;
                        if (token && !config.headers.Authorization) {
                            config.headers.Authorization = `Bearer ${token}`;
                        }
                    } catch {
                        // ignore
                    }
                }
                return config;
            },
            (error) => Promise.reject(error)
        );
    }

    private attachResponseInterceptor(): void {
        this.axiosInstance.interceptors.response.use(
            (response: AxiosResponse) => {
                const envelope = response.data as ApiSuccessResponse<unknown>;

                if (
                    envelope &&
                    typeof envelope === "object" &&
                    "isError" in envelope &&
                    envelope.isError === false &&
                    "data" in envelope
                ) {
                    return {
                        ...response,
                        data: envelope.data,
                    } as AxiosResponse;
                }

                return response;
            },
            (error) => {
                if (error.response?.data) {
                    const errorData = error.response.data as any;

                    if (
                        typeof errorData === "object" &&
                        errorData !== null &&
                        ("message" in errorData || "error" in errorData)
                    ) {
                        let errorMessage = "Request failed";
                        if (typeof errorData.message === "string") {
                            errorMessage = errorData.message;
                        } else if (Array.isArray(errorData.message)) {
                            errorMessage = errorData.message.join(", ");
                        } else if (typeof errorData.error === "string") {
                            errorMessage = errorData.error;
                        }

                        const apiError = new ApiError({
                            statusCode: errorData.statusCode ?? error.response?.status ?? 500,
                            timestamp: errorData.timestamp ?? new Date().toISOString(),
                            path: errorData.path ?? "",
                            message: errorMessage,
                        });
                        return Promise.reject(apiError);
                    }
                }

                if (error.response?.status === 401) {
                    if (typeof window !== "undefined") {
                        const currentPath = window.location.pathname;
                        const isPublicRoute = PUBLIC_ROUTES.some(
                            (route) => currentPath === route || currentPath.startsWith(route + "/")
                        );

                        if (!isPublicRoute) {
                            try {
                                removeStorageItems([
                                    AUTH_STORAGE_KEYS.ACCESS_TOKEN,
                                ]);
                            } catch {
                                // ignore
                            }
                            window.location.href = FRONTEND_ROUTES.LOGIN;
                        }
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    public static getInstance(): HttpService {
        if (!HttpService.instance) {
            HttpService.instance = new HttpService();
        }
        return HttpService.instance;
    }

    public get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.get<T>(url, config);
    }

    public post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.post<T>(url, data, config);
    }

    public put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.put<T>(url, data, config);
    }

    public patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.patch<T>(url, data, config);
    }

    public delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.delete<T>(url, config);
    }
}

export default HttpService.getInstance();
