const acceptFriendRequest = async (id) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/user/accept-friend`,
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

export default acceptFriendRequest;
