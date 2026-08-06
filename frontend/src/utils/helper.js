export const validateEmail = (email) => {
  if (typeof email !== "string") return false;

  const value = email.trim();

  if (!value || /\s/.test(value)) return false;

  const atIndex = value.indexOf("@");

  if (atIndex <= 0 || atIndex !== value.lastIndexOf("@")) {
    return false;
  }

  const dotIndex = value.indexOf(".", atIndex + 2);

  return dotIndex !== -1 && dotIndex < value.length - 1;
};


export const getInitials = (name) => {
  if (!name) return "";

  const words = name.split(" ");
  let initials = "";

  for (let i = 0; i < Math.min(words.length, 2); i++) {
    initials += words[i][0];
  }

  return initials.toUpperCase();
};