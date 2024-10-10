import Joi from "joi";

const registerBodyValidation = Joi.object({
  firstName: Joi.string().min(3).required().messages({
    "string.min": "First name must be at least 3 characters long",
    "any.required": "First name is required",
  }),
  lastName: Joi.string().min(3).required().messages({
    "string.min": "Last name must be at least 3 characters long",
    "any.required": "Last name is required",
  }),
  address: Joi.string().min(3).required().messages({
    "string.min": "Address must be at least 3 characters long",
    "any.required": "Address is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Email is not valid",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&/])[A-Za-z\\d@$!%*?&/]{8,}$"
      )
    ) // Regex for strong password
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password must not exceed 30 characters",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      "any.required": "Password is required",
    }),
});

export default registerBodyValidation;
