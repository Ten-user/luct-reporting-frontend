import React, { useEffect, useState } from "react";
import API from "../api";

export default function StudentCourses() {
  const [availableCourses, setAvailableCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableCourses();
    fetchMyCourses();
  }, []);

  // Fetch courses the student can enroll in
  async function fetchAvailableCourses() {
    setLoading(true);
    try {
      const res = await API.get("/courses/available"); // ✅ correct endpoint
      setAvailableCourses(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching available courses:", err);
    } finally {
      setLoading(false);
    }
  }

  // Fetch student's enrolled courses
  async function fetchMyCourses() {
    try {
      const res = await API.get("/student-courses/my");
      setMyCourses(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching my courses:", err);
    }
  }

  // Enroll in a course
  async function enroll(courseId) {
    try {
      await API.post("/student-courses/enroll", { course_id: courseId });
      alert("✅ Enrolled successfully");
      fetchAvailableCourses(); // refresh available courses
      fetchMyCourses();        // refresh enrolled courses
    } catch (err) {
      console.error("❌ Error enrolling:", err);
      alert(err.response?.data?.message || "Error enrolling in course");
    }
  }

  // Unenroll from a course
  async function unenroll(courseId) {
    try {
      await API.delete(`/student-courses/unenroll/${courseId}`);
      alert("✅ Unenrolled successfully");
      fetchAvailableCourses();
      fetchMyCourses();
    } catch (err) {
      console.error("❌ Error unenrolling:", err);
      alert("Error unenrolling from course");
    }
  }

  if (loading) return <div>Loading courses...</div>;

  return (
    <div>
      <h3>Available Courses</h3>
      <table className="table table-striped mb-4">
        <thead>
          <tr>
            <th>Course</th>
            <th>Code</th>
            <th>Class</th>
            <th>Faculty</th>
            <th>Venue</th>
            <th>Scheduled</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {availableCourses.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center">
                No available courses.
              </td>
            </tr>
          ) : (
            availableCourses.map((c) => (
              <tr key={c.id}>
                <td>{c.course_name}</td>
                <td>{c.course_code}</td>
                <td>{c.class_name}</td>
                <td>{c.faculty_name}</td>
                <td>{c.venue}</td>
                <td>{c.scheduled_time}</td>
                <td>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => enroll(c.id)}
                  >
                    Enroll
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h3>My Enrolled Courses</h3>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Course</th>
            <th>Code</th>
            <th>Class</th>
            <th>Faculty</th>
            <th>Venue</th>
            <th>Scheduled</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {myCourses.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center">
                You are not enrolled in any courses.
              </td>
            </tr>
          ) : (
            myCourses.map((c) => (
              <tr key={c.id}>
                <td>{c.course_name}</td>
                <td>{c.course_code}</td>
                <td>{c.class_name}</td>
                <td>{c.faculty_name}</td>
                <td>{c.venue}</td>
                <td>{c.scheduled_time}</td>
                <td>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => unenroll(c.id)}
                  >
                    Unenroll
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
