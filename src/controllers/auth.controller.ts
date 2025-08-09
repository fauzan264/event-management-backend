import { Request, Response } from "express";
import {
  authChangePasswordService,
  authLoginService,
  authRegisterService,
  authRequestResetPasswordService,
  authResetPasswordService,
  authSessionLoginService,
} from "../services/auth.service";

export const authRegisterController = async (req: Request, res: Response) => {
  const {
    id_card_number,
    full_name,
    date_of_birth,
    email,
    password,
    phone_number,
    referral_code,
    user_role,
  } = req.body;

  await authRegisterService({
    idCardNumber: id_card_number,
    fullName: full_name,
    dateOfBirth: date_of_birth,
    email: email,
    password: password,
    phoneNumber: phone_number,
    referralCode: referral_code,
    userRole: user_role,
  });

  res.status(201).json({
    success: true,
    message: "Register user successful",
    data: {
      full_name,
      email,
    },
  });
};

export const authLoginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { token, fullName, role } = await authLoginService({ email, password });

  res.status(200).json({
    success: true,
    message: `Login user successful`,
    data: { token, full_name: fullName, role },
  });
};

export const authRequestResetPasswordController = async (
  req: Request,
  res: Response
) => {
  const { email } = req.body;

  await authRequestResetPasswordService({ email });

  res.status(200).json({
    success: true,
    message: "Password reset link has been sent to your email address.",
  });
};

export const authResetPasswordController = async (
  req: Request,
  res: Response
) => {
  const { password } = req.body;
  const { userId } = res.locals.payload;

  await authResetPasswordService({ id: userId, password });

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
};

export const authSessionLoginController = async (
  req: Request,
  res: Response
) => {
  const { userId } = res.locals.payload;

  const { role, full_name } = await authSessionLoginService({ id: userId });

  res.status(200).json({
    success: true,
    message: "Session data retrieved successfully.",
    data: { id: userId, full_name, role },
  });
};

export const authChangePasswordController = async (
  req: Request,
  res: Response
) => {
  const { old_password, new_password } = req.body;
  const { userId } = res.locals.payload;

  await authChangePasswordService({
    oldPassword: old_password,
    newPassword: new_password,
    userId,
  });

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
};
