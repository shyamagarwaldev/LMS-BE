import { z } from "zod";

const signInSchema = z.object({
  email: z.string().email("Invailed Email"),
  password: z.string().min(8, "The password must be altest 8 character"),
});

export default signInSchema;
