// Lazy loading helper
export const lazyLoad = (importFunc) => {
  return React.lazy(importFunc)
}

// Image optimization
export const optimizeImage = (src, width = 400, height = 300, quality = 80) => {
  if (src.includes('unsplash')) {
    return `${src}?w=${width}&h=${height}&q=${quality}&fit=crop`
  }
  return src
}

// Debounce for search
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Local storage helpers
export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.error('Error saving to localStorage:', e)
    }
  },
  get: (key) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (e) {
      console.error('Error reading from localStorage:', e)
      return null
    }
  }
}
