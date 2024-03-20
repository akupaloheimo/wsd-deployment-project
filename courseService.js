const sessionCounts = new Map();

const getVisits = async (id, cId) => {
    const kv = await Deno.openKv();
    const count = await kv.get(["Feedback", `${cId}`, `${id}`]);
    return count?.value ?? "0";
  };
  
const incrementVisits = async (feedbackId, courseId, sessionId) => {
    const counts = {
      "1": await getVisits(1, courseId),
      "2": await getVisits(2, courseId),
      "3": await getVisits(3, courseId),
      "4": await getVisits(4, courseId),
      "5": await getVisits(5, courseId)
    };

    incrementCount(sessionId);
    counts[feedbackId]++; 
    await setVisits(feedbackId, courseId, counts[feedbackId]);
  };

const setVisits = async (feedbackId, courseId, count) => {
    const kv = await Deno.openKv();
    await kv.set(["Feedback", `${courseId}`, `${feedbackId}`], count);
  };

const createCourse = async (course) => {
    course.id = crypto.randomUUID();
    const kv = await Deno.openKv();
    await kv.set(["courses", course.id], course);
  };

const listCourses = async () => {
    const kv = await Deno.openKv();
    const courseEntries = await kv.list({ prefix: ["courses"]});
    const courses = [];
    for await ( const entry of courseEntries) {
      courses.push(entry.value);
    }

    return courses;
  };

const getCourse = async (id) => {
    const kv = await Deno.openKv();
    const course = await kv.get(["courses", id]);
    return course?.value ?? {};
  };

const deleteCourse = async (id) => {
    const kv = await Deno.openKv();
    await kv.delete(["courses", id]);
  };

const incrementCount = (sessionId) => {
  let count = sessionCounts.get(sessionId) ?? 0;
  count++;
  sessionCounts.set(sessionId, count);
};

const getCount = (sessionId) => {
  const count = sessionCounts.get(sessionId) ?? 0;
  return count;
}

  export { getVisits, incrementVisits, createCourse, listCourses, deleteCourse, setVisits, getCourse, incrementCount, getCount };