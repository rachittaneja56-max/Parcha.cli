import UserService from "@repo/services/user";
import AuthService from "@repo/services/auth";
import FormService from "@repo/services/form";
import ResponseService from "@repo/services/response";
import AnalyticsService from "@repo/services/analytics";

export const userService = new UserService();
export const authService = new AuthService();
export const formService = new FormService();
export const responseService = new ResponseService();
export const analyticsService = new AnalyticsService();
