import React from "react";
import TermsOfUsePage from "../Components/Termsofusepage";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const page = () => {
  return (
    <>
      <Navbar />
      <TermsOfUsePage />
      <Footer  visible={false}/>
    </>
  );
};

export default page;
