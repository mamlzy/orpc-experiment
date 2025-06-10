export const generateArray = (length: number) => {
  if (!length) throw new Error('"length" parameter is required');
  return Array.from(Array(length).keys());
};

export const startCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase words
    .replace(/[_-]+/g, ' ') // Replace underscores and hyphens with space
    .replace(/([a-zA-Z0-9]+)/g, (match) => {
      return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase(); // Capitalize first letter of each word
    })
    .trim(); // Trim any leading or trailing whitespace
};

export const lowerCase = (str: string): string => {
  return (
    str
      // Split on word boundaries and transitions between lowercase and uppercase
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .match(/[A-Za-z0-9]+/g)
      ?.map((word) => word.toLowerCase())
      .join(' ') || ''
  );
};
