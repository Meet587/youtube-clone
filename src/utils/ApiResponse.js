class ApiResponse {
  constructor(statsusCode, data, message = "success") {
    this.statsusCode = statsusCode;
    this.data = data;
    this.message = message;
    this.success = statsusCode < 400;
  }
}
