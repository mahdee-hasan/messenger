const doLike = async (postId) => {
  try {
    const res = fetch(
      `${import.meta.env.VITE_API_URL}/api/feeds/likes?postId=${postId}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    if (!res.ok) {
      throw new Error("error liking the post");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    return { success: false, error: error.message };
  }
};
export default doLike;
