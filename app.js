import { Hono } from "https://deno.land/x/hono@v3.7.4/mod.ts";
import * as courseController from "./courseController.js";

const app = new Hono();

//courseController.resetVisits;

app.get("/courses", courseController.showCourses);
app.get("/courses/:courseId", courseController.showCourse);
app.get("/courses/:courseId/feedbacks/:id", courseController.showFeedback);

app.post("/courses", courseController.createCourse);
app.post("/courses/:courseId/delete", courseController.deleteCourse)
app.post("/courses/:courseId/feedbacks/:id", courseController.incrementVisits);

export default app;