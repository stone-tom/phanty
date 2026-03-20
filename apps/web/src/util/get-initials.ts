export const getInitials = (fullName: string) => {
  const parts = fullName.split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();

  return `${parts[0][0].toUpperCase()}${parts[parts.length - 1][0].toUpperCase()}`;
};
