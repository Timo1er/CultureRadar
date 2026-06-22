import React, { useState } from "react";
import RegisterStep1 from "./RegisterStep1";
import RegisterStep2 from "./RegisterStep2";

const Register = () => {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
    preferences: [],
  });

  const [errors, setErrors] = useState({});

  return (
    <div>
      {step === 1 && (
        <RegisterStep1
          userData={userData}
          setUserData={setUserData}
          setStep={setStep}
          errors={errors}
          setErrors={setErrors}
        />
      )}
      {step === 2 && (
        <RegisterStep2
          userData={userData}
          setUserData={setUserData}
          setStep={setStep}
          errors={errors}
          setErrors={setErrors}
        />
      )}
    </div>
  );
};

export default Register;
