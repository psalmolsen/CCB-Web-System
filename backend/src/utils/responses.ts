export function success(message: string, data: any = null) {
  return { success: true, message, data };
}

export function fail(message: string, status = 400) {
  return { success: false, message, data: null, status };
}
