export interface Contest {
  id: string;
  name: string;
  role: string;
  contestDate: Date;
  editalText?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContestRequest {
  name: string;
  role: string;
  contestDate: Date;
  editalText: string;
}

export interface ListContestsResponse {
  contests: Contest[];
}
