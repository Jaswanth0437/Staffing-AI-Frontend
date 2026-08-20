const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/.+/i;
export function validateLeadForm(values) {
  const errors = {};
  if (!values.first_name.trim()) errors.first_name = "First name is required.";
  if (!values.last_name.trim()) errors.last_name = "Last name is required.";
  if (!values.company_name.trim()) errors.company_name = "Company name is required.";
  if (values.email && !EMAIL_REGEX.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (values.linkedin_url && !URL_REGEX.test(values.linkedin_url)) {
    errors.linkedin_url = "Enter a valid URL starting with http:// or https://.";
  }
  if (values.company_website && !URL_REGEX.test(values.company_website)) {
    errors.company_website = "Enter a valid URL starting with http:// or https://.";
  }
  if (values.company_linkedin_url && !URL_REGEX.test(values.company_linkedin_url)) {
    errors.company_linkedin_url = "Enter a valid URL starting with http:// or https://.";
  }
  if (values.employee_count && Number.isNaN(Number(values.employee_count))) {
    errors.employee_count = "Employee size must be a number.";
  }
  return errors;
}
export function isFormValid(errors) {
  return Object.keys(errors).length === 0;
}
