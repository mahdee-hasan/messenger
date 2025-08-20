const rejectFriend = async (id) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/user/reject-friend/${id}`,
      {
        credentials: "include",
        method: "DELETE",
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

export default rejectFriend;
