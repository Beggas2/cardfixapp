export type LogLevel = "INFO" | "WARN" | "ERROR";

export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  details?: any;
  userId?: string;
  createdAt: Date;
}

export interface CreateLogRequest {
  level: LogLevel;
  message: string;
  details?: any;
}

export interface ListLogsResponse {
  logs: LogEntry[];
}
