const { z } = require("zod");

const signupSchema = z.object({
  username: z.string().trim().min(3, "Username must be at least 3 characters"),
  email: z.string().trim().email("Invalid email format").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email format").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

const updateSchema = z.object({
  email: z.string().trim().email("Invalid email format").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    req.body = result.data;
    next();
  };
}

module.exports = {
  signupSchema,
  loginSchema,
  updateSchema,
  deleteAccountSchema,
  validate,
};
