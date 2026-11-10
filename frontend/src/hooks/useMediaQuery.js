import { useState, useEffect } from 'react';

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Check if the media query matches on initial render
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    // Add event listener for changes
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);

    // Cleanup
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

export default useMediaQuery;
