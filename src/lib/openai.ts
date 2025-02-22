// src/lib/openai.ts
export const generateNotes = async (transcript: string): Promise<string> => {
    try {
      const response = await fetch('/api/generate-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate notes');
      }
  
      const data = await response.json();
      return data.notes;
    } catch (error) {
      console.error('Error generating notes:', error);
      throw new Error(`Failed to generate notes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };