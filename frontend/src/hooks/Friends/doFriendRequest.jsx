const doFriendRequest = async (id) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/user/friends`,
      {
        credentials: "include",
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ id }),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      return data;
    }
    if (data.success) {
      return data;
    }
  } catch (error) {
    return { error: error.message };
  }
};

export default doFriendRequest;
