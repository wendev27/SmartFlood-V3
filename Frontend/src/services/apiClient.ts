export async function apiClient<T>(mockValue: T): Promise<T> {
  return Promise.resolve(mockValue);
}
