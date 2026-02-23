import * as yup from "yup";

export const registerSchema = yup.object({
  username: yup
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .required("Username is required"),

  email: yup
    .string()
    .email("Email is not valid")
    .matches(/@vcet\.edu\.in$/, "Only @vcet.edu.in email allowed")
    .required("Email is required"),

  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)/,
      "Password must contain at least one letter and one number"
    )
    .required("Password is required"),
});

export const loginSchema = yup.object({
  email: yup
    .string()
    .email("Email is not valid")
    .required("Email is required"),

  password: yup
    .string()
    .required("Password is required"),
});

export const changePasswordSchema = yup.object({
  oldPassword: yup
    .string()
    .required("Old password is required"),

  newPassword: yup
    .string()
    .min(6, "New password must be at least 6 characters")
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)/,
      "Password must contain at least one letter and one number"
    )
    .required("New password is required"),
});

export const validate = (schema) => async (req, res, next) => {
  try {
    await schema.validate(req.body, { abortEarly: false });
    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.errors[0],
      errors: err.errors,
    });
  }
};