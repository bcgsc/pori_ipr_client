const getDate = (time = true) => {
  const date = new Date();
  const formattedDate = new Intl.DateTimeFormat('en-ca', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: time ? '2-digit' : undefined,
    minute: time ? '2-digit' : undefined,
    second: time ? '2-digit' : undefined,
    hour12: false,
  }).format(date);

  return formattedDate.replace(', ', '__').replace(/:/g, '-');
};

export default getDate;
