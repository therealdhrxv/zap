import { z } from "zod";

export const SignupSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
	name: z.string(),
});

export const SigninSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});
