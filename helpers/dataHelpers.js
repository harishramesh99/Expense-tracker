import Handlebars from 'handlebars';

// Define the 'formatDate' helper
Handlebars.registerHelper('formatDate', function (date) {
  // Format the date (using something like moment.js or the native Date object)
  const formattedDate = new Date(date).toLocaleDateString();
  return formattedDate;
});

export default {
  formatDate: Handlebars.helpers.formatDate,  // Export your helper
};