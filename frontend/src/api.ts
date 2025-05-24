const API_BASE = 'http://localhost:8000';

export interface MatchResponse {
  labs: Lab[];
  processing_time: number;
}

export interface Lab {
  id: number;
  name: string;
  university: string;
  pi: string;
  email: string;
  summary: string;
  similarity_score: number;
}

export interface ProgressResponse {
  status: 'idle' | 'processing' | 'complete' | 'error';
  progress: number;
}

export async function matchText(text: string, university: string): Promise<MatchResponse> {
  const response = await fetch(`${API_BASE}/match`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, university }),
  });

  if (!response.ok) {
    throw new Error(`matching failed: ${response.statusText}`);
  }

  return response.json();
}

export async function matchFile(file: File, university: string): Promise<MatchResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('university', university);

  const response = await fetch(`${API_BASE}/match/file`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`file matching failed: ${response.statusText}`);
  }

  return response.json();
}

export async function getProgress(): Promise<ProgressResponse> {
  const response = await fetch(`${API_BASE}/progress`);
  return response.json();
}

export async function getUniversities(): Promise<string[]> {
  const response = await fetch(`${API_BASE}/universities`);
  const data = await response.json();
  return data.universities;
} 