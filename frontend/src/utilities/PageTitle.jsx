import React from "react";
import { HeadProvider, Title } from "react-head";

const PageTitle = ({ title }) => {
  return (
    <HeadProvider>
      <Title>{title}</Title>
    </HeadProvider>
  );
};

export default PageTitle;
