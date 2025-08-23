import PageTitle from "@/utilities/PageTitle";
import React from "react";
import { useSearchParams } from "react-router";
const ImagePreview = () => {
  const [searchParams] = useSearchParams();
  const url = searchParams.get("url");

  return (
    <div className="mx-auto my-0 max-w-3xl">
      <PageTitle title="preview image - social_box application" />
      <img src={url} className="max-h-[80vh] mx-auto" alt="image" />
    </div>
  );
};

export default ImagePreview;
