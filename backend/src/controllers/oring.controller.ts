import { oringService } from "../services/oring.service.js";

export async function listOrings(_req: any, res: any, next: any) {
  try {
    const data = await oringService.list();
    res.json({ success: true, message: "O-Rings loaded", data });
  } catch (error) {
    next(error);
  }
}
