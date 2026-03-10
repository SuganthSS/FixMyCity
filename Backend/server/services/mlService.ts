import axios from 'axios';

/**
 * ML Service Integration
 * This service handles communication with the ML model for issue classification
 */
const analyzeComplaint = async (description: string, imageUrl: string) => {
  try {
    // In a real scenario, this would be a real POST request to an ML endpoint
    // const response = await axios.post('http://ml-service/analyze', { description, imageUrl });
    // return response.data;

    // For now, we simulate the ML service response
    console.log('Analyzing complaint with ML service...', { description, imageUrl });
    
    // Mock logic: predict category based on keywords
    let category = 'General';
    if (description.toLowerCase().includes('pothole') || description.toLowerCase().includes('road')) {
      category = 'Road Maintenance';
    } else if (description.toLowerCase().includes('garbage') || description.toLowerCase().includes('trash')) {
      category = 'Sanitation';
    } else if (description.toLowerCase().includes('light') || description.toLowerCase().includes('street')) {
      category = 'Street Lighting';
    }

    // Mock logic: predict priority
    let priority = 'MEDIUM';
    if (description.toLowerCase().includes('danger') || description.toLowerCase().includes('accident')) {
      priority = 'HIGH';
    } else if (description.toLowerCase().includes('emergency')) {
      priority = 'CRITICAL';
    }

    return {
      category,
      priority,
      confidence: 0.95
    };
  } catch (error) {
    console.error('ML Service Error:', error);
    // Fallback to defaults if ML service fails
    return {
      category: 'Uncategorized',
      priority: 'MEDIUM',
      confidence: 0
    };
  }
};

export { analyzeComplaint };
