import { z } from "zod";

const signUpSchema = z.object({
  username: z
    .string()
    .min(3, "The username is too short")
    .max(50, "The username is too long"),
  email: z.string().email("Invailed Email"),
  password: z.string().min(8, "The password must be altest 8 character"),
});

export default signUpSchema;
