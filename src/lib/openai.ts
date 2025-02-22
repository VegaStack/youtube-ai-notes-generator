/**
 * Generates notes from transcript using OpenAI API
 */
export const generateNotes = async (transcript: string): Promise<string> => {
    try {
      // Using absolute path for API route
      const response = await fetch('/api/generate-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });
  
      if (!response.ok) {
        console.error('API Response Status:', response.status);
        console.error('API Response Status Text:', response.statusText);
        
        let errorMessage = 'Failed to generate notes';
        try {
          const error = await response.json();
          errorMessage = error.message || error.error || errorMessage;
        } catch {
          // If parsing JSON fails, use the default error message
        }
        throw new Error(errorMessage);
      }
  
      const data = await response.json();
      
      if (!data.notes) {
        throw new Error('No notes received from API');
      }
      
      return data.notes;
    } catch (error) {
      console.error('Error generating notes:', error);
      throw new Error(`Failed to generate notes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };