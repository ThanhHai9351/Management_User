export const GlobalResponseData = <T>(
  status: number,
  message: string,
  data: T | T[],
) => {
  return { status, message, data };
};

export const GlobalResponse = (status: number, message: string) => {
  return { status, message };
};
