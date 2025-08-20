import { FaGlobe, FaLock, FaUsers } from "react-icons/fa";

const getPrivacyIcon = (privacy) => {
  switch (privacy) {
    case "public":
      return <FaGlobe title="Public" />;
    case "friends":
      return <FaUsers title="Friends" />;
    case "private":
      return <FaLock title="Only Me" />;
    default:
      return null;
  }
};

export default getPrivacyIcon;
