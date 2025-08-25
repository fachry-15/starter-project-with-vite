import CONFIG from '../config';

const API_BASE_URL = 'https://story-api.dicoding.dev/v1';

const ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/register`,
  LOGIN: `${API_BASE_URL}/login`,
  STORIES: `${API_BASE_URL}/stories`,
  ADD_STORY: `${API_BASE_URL}/stories`,
  ADD_GUEST_STORY: `${API_BASE_URL}/stories/guest`, // New endpoint for guest stories
  STORY_DETAIL: (id) => `${API_BASE_URL}/stories/${id}`,
};

// Authentication API Functions
export async function registerUser({ name, email, password }) {
  try {
    const response = await fetch(ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Registration failed');
    }

    return {
      success: true,
      message: result.message,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

export async function loginUser({ email, password }) {
  try {
    console.log('API: Attempting login to:', ENDPOINTS.LOGIN);
    console.log('API: Login payload:', { email, password: '***' });
    
    const response = await fetch(ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    console.log('API: Response status:', response.status);
    const result = await response.json();
    console.log('API: Response data:', result);
    
    if (!response.ok) {
      throw new Error(result.message || 'Login failed');
    }

    return {
      success: true,
      message: result.message,
      data: result.loginResult
    };
  } catch (error) {
    console.error('API: Login error:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

// Stories API Functions
export async function getStories() {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Missing authentication');
    }

    const response = await fetch(ENDPOINTS.STORIES, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Missing authentication');
      }
      throw new Error(result.message || 'Failed to fetch stories');
    }

    return {
      success: true,
      data: result.listStory
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

export async function getStoryDetail(id) {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Missing authentication');
    }

    const response = await fetch(ENDPOINTS.STORY_DETAIL(id), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Missing authentication');
      }
      throw new Error(result.message || 'Failed to fetch story detail');
    }

    return {
      success: true,
      data: result.story
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

export async function addStory({ description, photo, lat, lon }) {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);
    
    if (lat && lon) {
      formData.append('lat', lat);
      formData.append('lon', lon);
    }

    const response = await fetch(ENDPOINTS.ADD_STORY, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to add story');
    }

    return {
      success: true,
      message: result.message,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

export async function addGuestStory({ description, photo, lat, lon }) {
  try {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);

    if (lat && lon) {
      formData.append('lat', lat);
      formData.append('lon', lon);
    }

    const response = await fetch(ENDPOINTS.ADD_GUEST_STORY, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to add guest story');
    }

    return {
      success: true,
      message: result.message,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// Utility function for authenticated requests
export async function makeAuthenticatedRequest(url, options = {}) {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    throw new Error('Authentication token not found');
  }

  const defaultHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const mergedOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, mergedOptions);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Request failed');
  }

  return result;
}

// Legacy function for backward compatibility
export async function getData() {
  return await getStories();
}