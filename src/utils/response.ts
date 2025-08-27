export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

export const ok = <T>(data: T): ApiResponse<T> => ({ success: true, data });
export const fail = (message: string): ApiResponse<never> => ({ success: false, message });


