import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToastActions } from "@/lib/utils";
import { resetPasswordAsync, setPasswordAsync } from "@/redux/slices/authSlice";
import { AppDispatch } from "@/store";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

interface SetPasswordFormState {
  newPassword: string;
  confirmPassword: string;
  errors: {
    newPassword: string | null;
    confirmPassword: string | null;
  };
}

const ResetPassword: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { success, errorToast } = useToastActions();
  const isReset = location.pathname.includes("/reset-password/");
  const { id } = useParams<{ id: string }>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { loading, error } = useSelector((state: any) => state.auth);
  useEffect(() => {
    if (error) {
      errorToast(error);
    }
  }, [error]);
  const navigate = useNavigate();
  const [formState, setFormState] = useState<SetPasswordFormState>({
    newPassword: "",
    confirmPassword: "",
    errors: {
      newPassword: null,
      confirmPassword: null,
    },
  });
  const validateNewPassword = (password: string): string | null => {
    if (!password) return "New password is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
    if (!/\d/.test(password)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*]/.test(password))
      return "Password must contain at least one special character.";
    return null;
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
    if (!confirmPassword) return "Confirm password is required.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleBlur = (field: keyof SetPasswordFormState["errors"]) => {
    const { newPassword, confirmPassword } = formState;
    const errors = { ...formState.errors };

    if (field === "newPassword") {
      errors.newPassword = validateNewPassword(newPassword);
    }

    if (field === "confirmPassword") {
      errors.confirmPassword = validateConfirmPassword(newPassword, confirmPassword);
    }

    setFormState((prev) => ({ ...prev, errors }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
      errors: {
        ...prev.errors,
        [name]: null, // Clear error as user types
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { newPassword, confirmPassword } = formState;
    const newPasswordError = validateNewPassword(newPassword);
    const confirmPasswordError = validateConfirmPassword(newPassword, confirmPassword);

    if (newPasswordError || confirmPasswordError) {
      setFormState((prev) => ({
        ...prev,
        errors: {
          newPassword: newPasswordError,
          confirmPassword: confirmPasswordError,
        },
      }));
      return;
    }
    if (id) {
      try {
        const result = isReset
          ? await dispatch(resetPasswordAsync({ token: id, newPassword })).unwrap()
          : await dispatch(setPasswordAsync({ userId: id, password: newPassword })).unwrap();
        if (result) {
          success(isReset ? "Password reset successful." : "Password set successfully.");
          navigate("/login");
        }
      } catch (error) {
        console.error("Login error:", error);
      }
    }

    // Submit the form (e.g., call API)
    console.log("Password successfully set!");
  };
  return (
    <div className="grid grid-cols-2 p-6 h-full min-h-screen">
     <Spinner show={loading} fullScreen />
      <div className="px-3 flex flex-col justify-center items-center">
        <div className="text-center flex justify-center md:mb-24 mb-4">
          <img src="/images/mainLogo.png" alt="" className="max-w-[111px]" />
        </div>
        <form onSubmit={handleSubmit} className="max-w-[447px] w-full mx-auto">
          <h1 className="text-2xl font-medium mb-12">{!isReset ? "Set" : "Reset"} Password</h1>
          <div className="flex flex-col gap-9">
            <div>
              <label htmlFor="new-password" className="text-sm mb-2 inline-block">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={formState.newPassword}
                onChange={handleChange}
                onBlur={() => handleBlur("newPassword")}
                id="new-password"
                placeholder="Enter New Password"
                className="block border border-input rounded-sm outline-none px-3 py-[7px] text-sm w-full"
              />
              {/* Error Message */}
              {formState.errors.newPassword && (
                <p className="text-xs text-red-500">{formState.errors.newPassword}</p>
              )}
              {/*  */}
            </div>
            <div>
              <label htmlFor="confirm-password" className="text-sm mb-2 inline-block">
                Confirm new Password
              </label>
              <input
                type="password"
                placeholder="Confirm new Password"
                id="confirm-password"
                name="confirmPassword"
                value={formState.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur("confirmPassword")}
                className="block border border-input rounded-sm outline-none px-3 py-[7px] text-sm w-full"
              />
              {formState.errors.confirmPassword && (
                <p className="text-xs text-red-500">{formState.errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Button variant="default" className="min-w-[150px]" type="submit">
                {!isReset ? "Set" : "Reset"} Password
              </Button>
              <p className="text-muted text-sm block">
                Remember?{" "}
                <Link to={"/login"} className="text-[#3860E2]">
                  Back to Login
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>

      <div className="rounded-lg flex justify-center items-center bg-secondary relative">
        <img src="/images/authImage.png" alt="auth-image" className="max-w-[526px] w-full" />

        <p className="text-sm text-[#334155] absolute bottom-6 right-6">*Terms & Conditions</p>
      </div>
    </div>
  );
};

export default ResetPassword;
