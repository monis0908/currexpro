import { userService } from "../services/userService.js";
import { ApiError } from "../utils/ApiError.js";

export const userController = {
  async list(req, res) {
    const data = await userService.list();
    res.status(200).json({ success: true, data });
  },

  async create(req, res) {
    const { name, username, email, password, role } = req.body;
    if (!name || !username || !email || !password || !role) {
      throw new ApiError(400, "name, username, email, password and role are required.");
    }
    const data = await userService.create(req.body);
    res.status(201).json({ success: true, data });
  },

  async remove(req, res) {
    await userService.remove(req.params.uid);
    res.status(200).json({ success: true, message: "User removed." });
  },

  async updateRole(req, res) {
    const { role } = req.body;
    if (!role) throw new ApiError(400, "role is required.");
    const data = await userService.updateRole(req.params.uid, role);
    res.status(200).json({ success: true, data });
  },
};