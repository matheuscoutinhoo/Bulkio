export interface ApiResponse<T = unknown> {
   success: boolean;
   data: T;
   message?: string;
   errors?: FieldError[];
   pagination?: PaginationMeta;
}

export interface FieldError {
   field: string;
   message: string;
}

export interface PaginationMeta {
   page: number;
   limit: number;
   total: number;
   totalPages: number;
}

export interface JwtPayload {
   userId: string;
   email: string;
}

export interface AuthTokens {
   accessToken: string;
   refreshToken: string;
}

export function createResponse<T>(data: T, message?: string): ApiResponse<T> {
   return { success: true, data, message };
}

export function createPaginatedResponse<T>(
   data: T,
   pagination: PaginationMeta,
   message?: string,
): ApiResponse<T> {
   return { success: true, data, message, pagination };
}

export function createErrorResponse(message: string, errors?: FieldError[]): ApiResponse<null> {
   return { success: false, data: null, message, errors };
}
