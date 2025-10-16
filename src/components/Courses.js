import React, { useEffect, useState } from 'react';
import API from '../api';

export default function Courses() {
  const [availableCourses, setAvailableCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const role = localStorage.getItem('role');

  const [form, setForm] = useState({
    faculty_name: '',
    class_name: '',
    course_name: '',
    course_code: '',
    venue: '',
    scheduled_time: '',
    total_registered: ''
  });

  // Fetch courses on mount
  useEffect(() => {
    if (role === 'student') {
      fetchAvailableCourses();
      fetchMyCourses();
    } else {
      fetchAllCourses();
    }
  }, []);

  // Fetch available courses for students
  async function fetchAvailableCourses() {
    setLoading(true);
    try {
      const res = await API.get('/courses/available');
      setAvailableCourses(res.data || []);
    } catch (err) {
      console.error('❌ Error fetching available courses:', err);
    } finally {
      setLoading(false);
    }
  }

  // Fetch student's enrolled courses
  async function fetchMyCourses() {
    try {
      const res = await API.get('/student-courses/my');
      setMyCourses(res.data || []);
    } catch (err) {
      console.error('❌ Error fetching my courses:', err);
    }
  }

  // Fetch all courses (PL / lecturers)
  async function fetchAllCourses() {
    setLoading(true);
    try {
      const res = await API.get('/courses');
      setAllCourses(res.data || []);
    } catch (err) {
      console.error('❌ Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  }

  // Handle form input changes
  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Add a new course (PL only)
  async function addCourse(e) {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        total_registered: Number(form.total_registered) || 0
      };
      const res = await API.post('/courses', payload);
      alert('✅ Course added successfully');

      const newCourse = res.data.course || { id: res.data.id, ...payload, lecturers: '' };
      setAllCourses(prev => [...prev, newCourse]);

      setForm({
        faculty_name: '',
        class_name: '',
        course_name: '',
        course_code: '',
        venue: '',
        scheduled_time: '',
        total_registered: ''
      });
    } catch (err) {
      console.error('❌ Error adding course:', err);
      alert('Error adding course');
    }
  }

  // Enroll student
  async function enroll(courseId) {
    try {
      await API.post('/student-courses/enroll', { course_id: courseId });
      alert('✅ Enrolled');
      fetchAvailableCourses();
      fetchMyCourses();
    } catch (err) {
      alert(err.response?.data?.message || 'Error enrolling');
    }
  }

  // Unenroll student
  async function unenroll(courseId) {
    try {
      await API.delete(`/student-courses/unenroll/${courseId}`);
      alert('✅ Unenrolled');
      fetchAvailableCourses();
      fetchMyCourses();
    } catch (err) {
      alert('Error unenrolling');
    }
  }

  // Filter courses based on search
  const filterCourses = (courses) =>
    courses.filter(c =>
      c.course_name?.toLowerCase().includes(search.trim().toLowerCase()) ||
      c.course_code?.toLowerCase().includes(search.trim().toLowerCase()) ||
      c.class_name?.toLowerCase().includes(search.trim().toLowerCase()) ||
      c.faculty_name?.toLowerCase().includes(search.trim().toLowerCase())
    );

  if (loading) return <div>Loading courses...</div>;

  return (
    <div>
      <h3>Courses</h3>

      {/* Search Bar */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by course, code, class or faculty..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Add Course Form (PL only) */}
      {role === 'pl' && (
        <form onSubmit={addCourse} className="mb-4">
          <div className="row g-2">
            {['faculty_name','class_name','course_name','course_code','venue','scheduled_time','total_registered'].map(field => (
              <div className="col-md-4" key={field}>
                <input
                  type={field === 'total_registered' ? 'number' : 'text'}
                  name={field}
                  value={form[field]}
                  onChange={onChange}
                  className="form-control"
                  placeholder={field.replace('_',' ').toUpperCase()}
                  min={field==='total_registered'?0:undefined}
                  required={['faculty_name','class_name','course_name','course_code'].includes(field)}
                />
              </div>
            ))}
          </div>
          <button className="btn btn-primary mt-2">Add Course</button>
        </form>
      )}

      {/* Students: Available Courses */}
      {role === 'student' && (
        <>
          <h5>Available Courses</h5>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Course</th>
                <th>Code</th>
                <th>Class</th>
                <th>Lecturers</th>
                <th>Venue</th>
                <th>Scheduled</th>
                <th>Registered</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filterCourses(availableCourses).length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center">No available courses.</td>
                </tr>
              ) : (
                filterCourses(availableCourses).map(c => (
                  <tr key={c.id}>
                    <td>{c.course_name}</td>
                    <td>{c.course_code}</td>
                    <td>{c.class_name}</td>
                    <td>{c.lecturers || 'Unassigned'}</td>
                    <td>{c.venue}</td>
                    <td>{c.scheduled_time}</td>
                    <td>{c.total_registered}</td>
                    <td>
                      <button className="btn btn-success btn-sm" onClick={() => enroll(c.id)}>Enroll</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <h5>My Courses</h5>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Course</th>
                <th>Code</th>
                <th>Class</th>
                <th>Lecturers</th>
                <th>Venue</th>
                <th>Scheduled</th>
                <th>Registered</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filterCourses(myCourses).length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center">No enrolled courses.</td>
                </tr>
              ) : (
                filterCourses(myCourses).map(c => (
                  <tr key={c.id}>
                    <td>{c.course_name}</td>
                    <td>{c.course_code}</td>
                    <td>{c.class_name}</td>
                    <td>{c.lecturers || 'Unassigned'}</td>
                    <td>{c.venue}</td>
                    <td>{c.scheduled_time}</td>
                    <td>{c.total_registered}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => unenroll(c.id)}>Unenroll</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}

      {/* PL / Lecturer: All Courses */}
      {(role === 'pl' || role === 'lecturer') && (
        <>
          <h5>All Courses</h5>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Course</th>
                <th>Code</th>
                <th>Class</th>
                <th>Lecturers</th>
                <th>Venue</th>
                <th>Scheduled</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {filterCourses(allCourses).length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center">No courses found.</td>
                </tr>
              ) : (
                filterCourses(allCourses).map(c => (
                  <tr key={c.id}>
                    <td>{c.course_name}</td>
                    <td>{c.course_code}</td>
                    <td>{c.class_name}</td>
                    <td>{c.lecturers || 'Unassigned'}</td>
                    <td>{c.venue}</td>
                    <td>{c.scheduled_time}</td>
                    <td>{c.total_registered}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
