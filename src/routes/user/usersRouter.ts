import { Router } from "express";

import { createUser } from "../../controllers/usersController";

const usersRouter: Router = Router();

usersRouter.route("/").post(createUser);

export { usersRouter };
