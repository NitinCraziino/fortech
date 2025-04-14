import { Button } from "@/components/ui/button";
import { useToastActions } from "@/lib/utils";
import { forgotPasswordAsync } from "@/redux/slices/authSlice";
import { AppDispatch } from "@/store";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

interface FormData {
  email: string;
}

interface FormErrors {
  email?: string;
}

const ForgotPassword: React.FC = () => {
  const {success, errorToast} = useToastActions();
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<FormData>({ email: "" });
  const [errors, setErrors] = useState<FormErrors>({ email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = useSelector((state: any) => state.auth);
    useEffect(() => {
      if(error) {
        errorToast(error)
      }
    }, [error])
  const validateField = (name: string, value: string): string | undefined => {
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) {
        return "Email is required.";
      } else if (!emailRegex.test(value)) {
        return "Invalid email format.";
      }
    }
    return undefined;
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const error = validateField(name, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const newErrors: FormErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof FormData]);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        // Simulate API call
        console.log("Form submitted:", formData);
        await dispatch(forgotPasswordAsync({email:formData.email})).unwrap();
        success("Reset Link Sent.");
      } catch (error) {
        console.error("Login error:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  return (
    <div className="grid grid-cols-2 p-6 h-full min-h-screen">
      <div className="px-3 flex flex-col justify-center items-center">
        <div className="text-center flex justify-center md:mb-20 mb-4">
          <img src="images/mainLogo.png" alt="" className="max-w-[200px]" />
        </div>
        <form onSubmit={handleSubmit} className="max-w-[447px] w-full mx-auto">
          <h1 className="text-2xl font-medium mb-12">Forgot Password</h1>
          <div className="mb-9">
            <label htmlFor="email" className="text-sm mb-2 inline-block">
              Email Address
            </label>
            <input
              name="email"
              onBlur={handleBlur}
              onChange={handleChange}
              type="email"
              id="email"
              placeholder="Enter your Email Address"
              className="block border border-input rounded-sm outline-none px-3 py-[7px] text-sm w-full"
            />
            {touched.email && errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="mb-8 mt-2 flex items-center justify-between">
            <Button
              disabled={isSubmitting}
              variant="default"
              className="min-w-[150px]"
              type="submit"
            >
              {isSubmitting ? "Sending" : "Send Reset Link"}
            </Button>
            <p className="text-muted text-sm block">
              Remember?{" "}
              <Link to={"/login"} className="text-[#3860E2]">
                Back to Login
              </Link>
            </p>
          </div>
        </form>
      </div>

      <div className="rounded-lg flex justify-center items-center bg-secondary relative">
        <img src="images/authImage.png" alt="auth-image" className="max-w-[526px] w-full" />

        <p className="text-sm text-[#334155] absolute bottom-6 right-6">*Terms & Conditions</p>
      </div>
    </div>
  );
};

export default ForgotPassword;
