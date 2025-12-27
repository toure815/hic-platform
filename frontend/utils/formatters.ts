export const formatSSN = (value: string): string => {
  const input = value.replace(/\D/g, '').substring(0, 9);
  const parts = [];
  if (input.length > 5) {
    parts.push(input.substring(0, 3));
    parts.push(input.substring(3, 5));
    parts.push(input.substring(5));
  } else if (input.length > 3) {
    parts.push(input.substring(0, 3));
    parts.push(input.substring(3));
  } else {
    return input;
  }
  return parts.join('-');
};

export const formatEIN = (value: string): string => {
  const input = value.replace(/\D/g, '').substring(0, 9);
  if (input.length > 2) {
    return `${input.substring(0, 2)}-${input.substring(2)}`;
  }
  return input;
};

export const formatPhoneNumber = (value: string): string => {
  const input = value.replace(/\D/g, '').substring(0, 10);
  const areaCode = input.substring(0, 3);
  const middle = input.substring(3, 6);
  const last = input.substring(6, 10);

  if (input.length > 6) {
    return `(${areaCode}) ${middle}-${last}`;
  } else if (input.length > 3) {
    return `(${areaCode}) ${middle}`;
  } else if (input.length > 0) {
    return `(${areaCode}`;
  }
  return '';
};

export const formatDateMMDDYYYY = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,2})(\d{0,2})(\d{0,4})$/);
  if (!match) return value;
  return [match[1], match[2], match[3]].filter(Boolean).join('/').replace(/\/$/, '');
};
