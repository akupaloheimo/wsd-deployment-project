import { Eta } from "https://deno.land/x/eta@v3.1.0/src/index.ts";
import * as courseService from "./courseService.js";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import {
    getSignedCookie,
    setSignedCookie,
  } from "https://deno.land/x/hono@v3.7.4/helper.ts";


const eta = new Eta({ views: `${Deno.cwd()}/templates` });

const secret = "secret";

const validator = z.object({
    course: z.string({
        message: "The course name should be a string of at least 4 characters."
    }).min(4, {
        message: "The course name should be a string of at least 4 characters."
    }),
});

async function resetVisits() {
    for (let i = 1; i <= 5; i++) {
        await courseService.setVisits(0, i);
    };
  };

const showForm = (c) => {
    return c.html(eta.render("index.eta"));
};

const showFeedback = async (c) => {
    const id = c.req.param("id");
    const courseId = c.req.param("courseId")
    const visitCount = await courseService.getVisits(id, courseId);
    return c.html(eta.render("results.eta", {feedbackId: id, visits: visitCount}));
};

const showCourses = async (c) => {
    return c.html(eta.render("courses.eta", {courses: await courseService.listCourses()}));
};

const showCourse = async (c) => {
    const id = c.req.param("courseId");
    const course = await courseService.getCourse(id);
    const count = courseService.getCount(await getSignedCookie(c, secret, "sessionId") ?? 0);
    return c.html(eta.render("course.eta", {course: course, count: count}));
};

const createCourse = async (c) => {
    const body = await c.req.parseBody();
    const validationResult = validator.safeParse(body);
    if(!validationResult.success) {
        return c.html(
            eta.render("courses.eta", {
                    courses: await courseService.listCourses(),
                    ...body,
                    errors: validationResult.error.format(),
                }),
        );
    } else {
        await courseService.createCourse(body);
        return c.redirect("/courses");
    };
};

const deleteCourse = async (c) => {
    const id = c.req.param("courseId");
    await courseService.deleteCourse(id);
    return c.redirect("/courses");
};

const incrementVisits = async (c) => {
    const id = c.req.param("id")
    const courseId = c.req.param("courseId");
    const sessionId = await getSignedCookie(c, secret, "sessionId") ?? crypto.randomUUID();
    await setSignedCookie(c, "sessionId", sessionId, secret, {path: `/courses/${courseId}`});
    await courseService.incrementVisits(id, courseId, sessionId);
    return c.redirect(`/courses/${courseId}`);
};

/*const checkCount = async (c) => {
    const courseId = c.req.param("courseId");
    const sessionId = await getSignedCookie(c, secret, "sessionId") ?? crypto.randomUUID();
    await setSignedCookie(c, "sessionId", sessionId, secret, {path: `/courses/${courseId}`});
    const count = courseService.getAndIncrementCount(sessionId);
    return count
  };*/

export { resetVisits, showForm, showFeedback, incrementVisits, showCourse, showCourses, createCourse, deleteCourse };