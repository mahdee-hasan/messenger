const undoFriendRequest = async (id) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/user/undo-friend-request/${id}`,
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

export default undoFriendRequest;
