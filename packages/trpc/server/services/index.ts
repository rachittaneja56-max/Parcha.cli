import UserService from "@repo/services/user";
import AuthService from "@repo/services/auth";
import FormService from "@repo/services/form";
import ResponseService from "@repo/services/response";
import AnalyticsService from "@repo/services/analytics";
import AdminService from "@repo/services/admin";
import EmailService from "@repo/services/email";
import { db } from "@repo/database";

export const userService = new UserService(db);
export const authService = new AuthService(db);
export const formService = new FormService(db);
export const responseService = new ResponseService(db);
export const analyticsService = new AnalyticsService(db);
export const adminService = new AdminService(db);
export const emailService = new EmailService();
