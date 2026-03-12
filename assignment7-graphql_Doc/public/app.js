const GRAPHQL_URL = "/graphql";

const employeeForm = document.getElementById("employeeForm");
const employeeIdInput = document.getElementById("employeeId");
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const departmentInput = document.getElementById("department");
const startDateInput = document.getElementById("startDate");
const jobTitleInput = document.getElementById("jobTitle");
const salaryInput = document.getElementById("salary");
const employeeTableBody = document.getElementById("employeeTableBody");
const messageEl = document.getElementById("message");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

async function runGraphQL(query, variables = {}) {
  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
}

function showMessage(text, isError = false) {
  messageEl.textContent = text;
  messageEl.className = isError ? "message error" : "message success";
}

function clearForm() {
  employeeIdInput.value = "";
  firstNameInput.value = "";
  lastNameInput.value = "";
  departmentInput.value = "";
  startDateInput.value = "";
  jobTitleInput.value = "";
  salaryInput.value = "";

  submitBtn.textContent = "Add Employee";
  cancelEditBtn.classList.add("hidden");
}

async function loadEmployees() {
  const query = `
    query {
      employees {
        id
        firstName
        lastName
        department
        startDate
        jobTitle
        salary
      }
    }
  `;

  try {
    const data = await runGraphQL(query);
    renderEmployees(data.employees);
  } catch (error) {
    showMessage("Failed to load employees: " + error.message, true);
  }
}

function renderEmployees(employees) {
  employeeTableBody.innerHTML = "";

  if (employees.length === 0) {
    employeeTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="empty">No employees found.</td>
      </tr>
    `;
    return;
  }

  employees.forEach((employee) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${employee.firstName}</td>
      <td>${employee.lastName}</td>
      <td>${employee.department}</td>
      <td>${employee.startDate}</td>
      <td>${employee.jobTitle}</td>
      <td>$${Number(employee.salary).toLocaleString()}</td>
      <td>
        <button class="edit-btn" data-id="${employee.id}">Edit</button>
        <button class="delete-btn" data-id="${employee.id}">Delete</button>
      </td>
    `;

    employeeTableBody.appendChild(row);
  });

  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => handleEdit(btn.dataset.id, employees));
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => handleDelete(btn.dataset.id));
  });
}

function handleEdit(id, employees) {
  const employee = employees.find((emp) => emp.id === id);
  if (!employee) return;

  employeeIdInput.value = employee.id;
  firstNameInput.value = employee.firstName;
  lastNameInput.value = employee.lastName;
  departmentInput.value = employee.department;
  startDateInput.value = employee.startDate;
  jobTitleInput.value = employee.jobTitle;
  salaryInput.value = employee.salary;

  submitBtn.textContent = "Update Employee";
  cancelEditBtn.classList.remove("hidden");
}

async function handleDelete(id) {
  const confirmDelete = confirm("Are you sure you want to delete this employee?");
  if (!confirmDelete) return;

  const mutation = `
    mutation DeleteEmployee($id: ID!) {
      deleteEmployee(id: $id)
    }
  `;

  try {
    const data = await runGraphQL(mutation, { id });

    if (data.deleteEmployee) {
      showMessage("Employee deleted successfully.");
      await loadEmployees();
      clearForm();
    } else {
      showMessage("Delete failed.", true);
    }
  } catch (error) {
    showMessage("Failed to delete employee: " + error.message, true);
  }
}

employeeForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const input = {
    firstName: firstNameInput.value.trim(),
    lastName: lastNameInput.value.trim(),
    department: departmentInput.value,
    startDate: startDateInput.value,
    jobTitle: jobTitleInput.value.trim(),
    salary: Number(salaryInput.value),
  };

  const employeeId = employeeIdInput.value;

  try {
    if (employeeId) {
      const mutation = `
        mutation UpdateEmployee($id: ID!, $input: EmployeeUpdateInput!) {
          updateEmployee(id: $id, input: $input) {
            id
            firstName
            lastName
            department
            startDate
            jobTitle
            salary
          }
        }
      `;

      await runGraphQL(mutation, { id: employeeId, input });
      showMessage("Employee updated successfully.");
    } else {
      const mutation = `
        mutation CreateEmployee($input: EmployeeInput!) {
          createEmployee(input: $input) {
            id
            firstName
            lastName
            department
            startDate
            jobTitle
            salary
          }
        }
      `;

      await runGraphQL(mutation, { input });
      showMessage("Employee created successfully.");
    }

    clearForm();
    await loadEmployees();
  } catch (error) {
    showMessage("Operation failed: " + error.message, true);
  }
});

cancelEditBtn.addEventListener("click", () => {
  clearForm();
  showMessage("Edit canceled.");
});

loadEmployees();