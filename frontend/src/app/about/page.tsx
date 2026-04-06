"use client";

import Info from "../../components/Info";
import Steps from "../../components/Steps";
import KeyFeatures from "../../components/KeyFeatures";
import ResidueRiskForm from "../../components/ResidueRiskForm";

const About = () => {
    return (
        <div className="pb-20">
            <Info />
            <Steps />
            <KeyFeatures />
            <ResidueRiskForm />
        </div>
    );
};

export default About;
