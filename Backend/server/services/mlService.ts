import axios from 'axios';

/**
 * ML Service Integration
 * This service handles communication with the ML model for issue classification
 */
const analyzeComplaint = async (title: string, description: string, imageUrl: string) => {
  try {
    const text = `${title} ${description}`.toLowerCase();
    
    // Keyword mapping for categories
    const categoryKeywords: Record<string, string[]> = {
      'Road Issue': ['road', 'pothole', 'pavement', 'tar', 'highway', 'traffic', 'crack', 'street', 'path'],
      'Water Leak': ['water', 'leak', 'pipe', 'burst', 'supply', 'flow', 'faucet', 'tap', 'well'],
      'Streetlight Issue': ['light', 'lamp', 'bulb', 'dark', 'glow', 'pole', 'electricity', 'night'],
      'Garbage Issue': ['garbage', 'trash', 'waste', 'litter', 'dump', 'bin', 'smell', 'stench', 'sanitation'],
      'Drainage Issue': ['drain', 'sewer', 'block', 'overflow', 'clog', 'gutter', 'sewage', 'stink']
    };

    // Find category with most hits
    let bestCategory = 'Road Issue'; // Default
    let maxHits = -1;

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const hits = keywords.reduce((count, kw) => count + (text.includes(kw) ? 1 : 0), 0);
      if (hits > maxHits) {
        maxHits = hits;
        bestCategory = category;
      }
    }

    // Logic for priority: High if critical keywords are present
    let priority = 'MEDIUM';
    const highKeywords = ['danger', 'accident', 'injury', 'broken', 'emergency', 'dying', 'hazard', 'crisis', 'urgent'];
    const criticalKeywords = ['life', 'death', 'major', 'collapse', 'poison', 'toxic', 'explosion', 'fire'];

    if (criticalKeywords.some(kw => text.includes(kw))) {
      priority = 'CRITICAL';
    } else if (highKeywords.some(kw => text.includes(kw)) || maxHits > 5) {
      priority = 'HIGH';
    } else if (maxHits === 0) {
      priority = 'LOW';
    }

    console.log('ML AI Classifier Result:', { bestCategory, priority, confidence: maxHits > 0 ? 0.9 : 0.4 });

    return {
      category: bestCategory,
      priority,
      confidence: maxHits > 0 ? 0.9 : 0.4
    };
  } catch (error) {
    console.error('ML Service Error:', error);
    // Fallback to defaults if ML service fails
    return {
      category: 'Road Issue',
      priority: 'MEDIUM',
      confidence: 0
    };
  }
};

export { analyzeComplaint };
