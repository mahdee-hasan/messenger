const fetchData = async (userId) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/api/login/${userId}`,
    {
      credentials: "include",
      method: "GET",
    }
  );
  const data = await res.json();
  if (res.ok) {
    return { isLoggedIn: true, userData: data, error: null };
  } else {
    return { isLoggedIn: false, userData: null, error: data };
  }
};

export default fetchData;
