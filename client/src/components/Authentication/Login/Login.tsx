import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginAsync } from "@/redux/slices/authSlice";
import { AppDispatch } from "@/store";
import { useToastActions } from "@/lib/utils";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const Login: React.FC = () => {
  const { errorToast } = useToastActions();
  const [formData, setFormData] = useState<FormData>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = useSelector((state: any) => state.auth);

  useEffect(() => {
    if (error) {
      errorToast(error);
    }
  }, [error]);

  const validateField = (name: string, value: string): string | undefined => {
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) {
        return "Email is required.";
      } else if (!emailRegex.test(value)) {
        return "Invalid email format.";
      }
    }

    if (name === "password") {
      if (!value) {
        return "Password is required.";
      } else if (value.length < 6) {
        return "Password must be at least 6 characters long.";
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

        const result = await dispatch(
          loginAsync({ email: formData.email, password: formData.password })
        ).unwrap();
        if (result) {
          navigate("/products");
        }
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
          <h1 className="text-2xl font-medium mb-12">Login</h1>
          <div className="flex flex-col gap-9 mb-8">
            <div>
              <label htmlFor="email" className="text-sm mb-2 inline-block">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your Email Address"
                className="block border border-input rounded-sm outline-none px-3 py-[7px] text-sm w-full"
              />
              {/* Error Message */}
              {touched.email && errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>
            <div>
              <div>
                <label htmlFor="password" className="text-sm mb-2 inline-block">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="password"
                  name="password"
                  id="password"
                  onBlur={handleBlur}
                  value={formData.password}
                  onChange={handleChange}
                  className="block border border-input rounded-sm outline-none px-3 py-[7px] text-sm w-full"
                />
                {/* Error Message */}
                {touched.password && errors.password && (
                  <p className="text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="text-right mt-2">
                <Link
                  to={"/forgot-password"}
                  className="text-muted hover:text-muted-foreground font-inter text-xs block"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
          </div>

          <Button disabled={isSubmitting} variant="default" className="min-w-[130px]" type="submit">
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>

      <div className="rounded-lg flex justify-center items-center bg-secondary relative">
        <img src="images/authImage.png" alt="auth-image" className="max-w-[526px] w-full" />

        <p className="text-sm text-[#334155] absolute bottom-6 right-6">*Terms & Conditions</p>
      </div>
    </div>
  );
};

export default Login;
