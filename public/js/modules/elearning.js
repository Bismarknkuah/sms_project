// public/js/modules/elearning.js
SMS.protectPage();

document.addEventListener('DOMContentLoaded', () => {
  loadCourses();
  document.getElementById('enrollForm')
    ?.addEventListener('submit', handleEnroll);
});

async function loadCourses() {
  const uid = JSON.parse(localStorage.getItem('sms_user')).id;
  try {
    const courses = await SMS.apiRequest(`/elearning/student/${uid}/courses`);
    const grid = document.getElementById('coursesGrid');
    grid.innerHTML = '';
    courses.forEach(c => {
      const card = document.createElement('div');
      card.className = 'course-card';
      card.innerHTML = `
        <h3>${c.name}</h3>
        <p>By: ${c.instructorName}</p>
        <button onclick="viewCourse('${c._id}')">View</button>`;
      grid.appendChild(card);
    });
  } catch (err) {
    SMS.showNotification(err.message,'error');
  }
}

async function handleEnroll(e) {
  e.preventDefault();
  const studentId = JSON.parse(localStorage.getItem('sms_user')).id;
  const courseId  = document.getElementById('courseSelect').value;
  try {
    await SMS.apiRequest(`/elearning/courses/${courseId}/enroll`, {
      method: 'POST',
      body: JSON.stringify({ studentId })
    });
    SMS.showNotification('Enrolled successfully','success');
    loadCourses();
  } catch (err) {
    SMS.showNotification(err.message,'error');
  }
}

window.viewCourse = id => {
  window.location.href = `elearning-course.html?course=${id}`;
};
